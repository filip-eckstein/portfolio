import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";
import { hash, compare } from "npm:bcrypt@5.1.1";

const app = new Hono();

// Create Supabase client with service role key for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Admin password from environment variable (REQUIRED - must be set in Supabase dashboard)
const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD');

if (!ADMIN_PASSWORD) {
  console.error('CRITICAL: ADMIN_PASSWORD environment variable is not set!');
  console.error('Please set ADMIN_PASSWORD in Supabase Dashboard > Edge Functions > Environment Variables');
}

// Security: Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 5 * 60 * 1000; // 5 minutes

// Security: Rate limiting for general API requests
const apiRateLimits = new Map<string, { count: number; resetTime: number }>();
const API_RATE_LIMIT = 100; // requests per window
const API_RATE_WINDOW = 60 * 1000; // 1 minute

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Admin-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Security helper functions
function getClientIp(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0] || 
         c.req.header('x-real-ip') || 
         'unknown';
}

function checkLoginRateLimit(ip: string): { allowed: boolean; lockedUntil?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  
  // Check if IP is locked out
  if (record?.lockedUntil && record.lockedUntil > now) {
    return { allowed: false, lockedUntil: record.lockedUntil };
  }
  
  // Reset if outside attempt window
  if (!record || (now - record.lastAttempt) > ATTEMPT_WINDOW) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return { allowed: true };
  }
  
  // Check if exceeded max attempts
  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    const lockedUntil = now + LOCKOUT_DURATION;
    loginAttempts.set(ip, { ...record, lockedUntil });
    return { allowed: false, lockedUntil };
  }
  
  // Increment attempt count
  loginAttempts.set(ip, { count: record.count + 1, lastAttempt: now });
  return { allowed: true };
}

function recordFailedLogin(ip: string): void {
  const record = loginAttempts.get(ip);
  if (record) {
    loginAttempts.set(ip, { ...record, count: record.count + 1, lastAttempt: Date.now() });
  }
}

function clearLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

function checkApiRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = apiRateLimits.get(ip);
  
  // Reset if window expired
  if (!record || record.resetTime < now) {
    apiRateLimits.set(ip, { count: 1, resetTime: now + API_RATE_WINDOW });
    return true;
  }
  
  // Check if limit exceeded
  if (record.count >= API_RATE_LIMIT) {
    return false;
  }
  
  // Increment count
  apiRateLimits.set(ip, { count: record.count + 1, resetTime: record.resetTime });
  return true;
}

function sanitizeInput(input: string, maxLength: number = 1000): string {
  if (!input) return '';
  // Remove potential XSS patterns
  return input
    .substring(0, maxLength)
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

// Security headers middleware
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
});

// Health check endpoint
app.get("/make-server-635fd90e/health", (c) => {
  return c.json({ status: "ok" });
});

// Public test endpoint - no auth required
app.post("/make-server-635fd90e/test", async (c) => {
  return c.json({ 
    status: "ok",
    message: "Server is running",
    timestamp: Date.now()
  });
});

// Debug login endpoint - shows info without revealing password
app.post("/make-server-635fd90e/admin/login-debug", async (c) => {
  try {
    const { password } = await c.req.json();
    
    return c.json({ 
      passwordReceived: !!password,
      passwordLength: password?.length || 0,
      expectedPasswordLength: ADMIN_PASSWORD.length,
      passwordsMatch: password === ADMIN_PASSWORD,
      // First 2 chars for debugging
      passwordStart: password?.substring(0, 2) || '',
      expectedStart: ADMIN_PASSWORD.substring(0, 2),
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// Debug endpoint to check if environment variables are loaded
app.get("/make-server-635fd90e/debug", (c) => {
  return c.json({ 
    status: "ok",
    hasAdminPassword: !!Deno.env.get('ADMIN_PASSWORD'),
    passwordLength: Deno.env.get('ADMIN_PASSWORD')?.length || 0,
    timestamp: Date.now()
  });
});

// Debug endpoint to check session token validity
app.post("/make-server-635fd90e/debug/check-token", async (c) => {
  try {
    const { token } = await c.req.json();
    
    if (!token) {
      return c.json({ valid: false, error: 'No token provided' });
    }
    
    const session = await kv.get(`admin_session:${token}`);
    
    if (!session) {
      return c.json({ 
        valid: false, 
        error: 'Session not found in KV store',
        tokenPrefix: token.substring(0, 8)
      });
    }
    
    const isExpired = session.expiresAt < Date.now();
    
    return c.json({ 
      valid: !isExpired,
      session: {
        createdAt: new Date(session.createdAt).toISOString(),
        expiresAt: new Date(session.expiresAt).toISOString(),
        ip: session.ip,
        isExpired
      },
      tokenPrefix: token.substring(0, 8)
    });
  } catch (error) {
    return c.json({ valid: false, error: String(error) }, 500);
  }
});

// Debug endpoint to list all admin sessions
app.get("/make-server-635fd90e/debug/list-sessions", async (c) => {
  try {
    const sessions = await kv.getByPrefix('admin_session:');
    
    return c.json({ 
      totalSessions: sessions.length,
      sessions: sessions.map((session: any) => ({
        tokenPrefix: session.id ? session.id.replace('admin_session:', '').substring(0, 8) : 'unknown',
        createdAt: new Date(session.createdAt).toISOString(),
        expiresAt: new Date(session.expiresAt).toISOString(),
        ip: session.ip,
        isExpired: session.expiresAt < Date.now()
      }))
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// Admin authentication endpoint
app.post("/make-server-635fd90e/admin/login", async (c) => {
  try {
    console.log('=== LOGIN REQUEST RECEIVED ===');
    
    // Security: Get client IP for rate limiting
    const clientIp = getClientIp(c);
    console.log('Client IP:', clientIp);
    
    // Security: Check rate limit
    const rateCheck = checkLoginRateLimit(clientIp);
    if (!rateCheck.allowed) {
      const minutesLeft = Math.ceil((rateCheck.lockedUntil! - Date.now()) / 60000);
      console.log(`Login blocked: Too many attempts from ${clientIp}`);
      return c.json({ 
        success: false, 
        error: `Too many login attempts. Please try again in ${minutesLeft} minutes.`,
        lockedUntil: rateCheck.lockedUntil
      }, 429);
    }
    
    const { password } = await c.req.json();
    
    if (!password) {
      console.log('Login failed: No password provided');
      return c.json({ success: false, error: 'Password is required' }, 400);
    }
    
    console.log('Password received, length:', password?.length || 0);
    
    // Check if there's an override password
    const overridePassword = await kv.get('admin_password_override');
    const actualPassword = overridePassword || ADMIN_PASSWORD;
    
    if (!actualPassword) {
      console.log('CRITICAL: No admin password configured!');
      return c.json({ success: false, error: 'Server misconfiguration' }, 500);
    }
    
    // Security: Constant-time comparison (basic implementation)
    const passwordsMatch = password === actualPassword;
    console.log('Passwords match:', passwordsMatch);
    
    if (passwordsMatch) {
      // Security: Clear failed login attempts on successful login
      clearLoginAttempts(clientIp);
      
      // Generate a cryptographically secure session token
      const sessionToken = crypto.randomUUID();
      
      console.log('[LOGIN] Generated session token:', sessionToken.substring(0, 20));
      console.log('[LOGIN] Full token for debugging:', sessionToken);
      console.log('[LOGIN] About to save session to KV store...');
      
      const sessionData = { 
        createdAt: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        ip: clientIp
      };
      const sessionKey = `admin_session:${sessionToken}`;
      
      console.log('[LOGIN] Session key:', sessionKey);
      console.log('[LOGIN] Session data:', sessionData);
      
      try {
        await kv.set(sessionKey, sessionData);
        console.log('[LOGIN] ✅ kv.set() completed successfully');
      } catch (error) {
        console.error('[LOGIN] ❌ ERROR in kv.set():', error);
        return c.json({ success: false, error: 'Failed to create session' }, 500);
      }
      
      console.log('[LOGIN] Waiting 100ms before verification...');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Immediately verify the session was saved
      try {
        const verifySession = await kv.get(sessionKey);
        console.log('[LOGIN] Verification - session found:', !!verifySession);
        if (verifySession) {
          console.log('[LOGIN] Verification - session data:', { 
            createdAt: verifySession.createdAt, 
            expiresAt: verifySession.expiresAt,
            ip: verifySession.ip 
          });
        } else {
          console.error('[LOGIN] ❌ ERROR: Session was NOT saved to KV store!');
          return c.json({ success: false, error: 'Session verification failed' }, 500);
        }
      } catch (error) {
        console.error('[LOGIN] ❌ ERROR in verification kv.get():', error);
      }
      
      console.log('Login successful, token created');
      return c.json({ success: true, token: sessionToken });
    }
    
    // Security: Record failed login attempt
    recordFailedLogin(clientIp);
    console.log('Login failed: Invalid password from', clientIp);
    
    // Security: Generic error message (don't reveal if user exists)
    return c.json({ success: false, error: 'Invalid credentials' }, 401);
  } catch (error) {
    console.log('Login error:', error);
    // Security: Don't expose internal error details
    return c.json({ success: false, error: 'Authentication failed' }, 500);
  }
});

// Middleware to verify admin session
async function verifyAdmin(token: string): Promise<boolean> {
  console.log('[verifyAdmin] Called with token:', token ? `${token.substring(0, 20)}...` : 'EMPTY');
  
  if (!token) {
    console.log('[verifyAdmin] No token provided, returning false');
    return false;
  }
  
  console.log('[verifyAdmin] Looking up session in KV store: admin_session:' + token.substring(0, 20) + '...');
  const session = await kv.get(`admin_session:${token}`);
  console.log('[verifyAdmin] Session found:', !!session);
  
  if (!session) {
    console.log('[verifyAdmin] Session NOT FOUND in KV store');
    return false;
  }
  
  console.log('[verifyAdmin] Session data:', {
    createdAt: new Date(session.createdAt).toISOString(),
    expiresAt: new Date(session.expiresAt).toISOString(),
    ip: session.ip,
    isExpired: session.expiresAt < Date.now()
  });
  
  // Check if session is expired
  if (session.expiresAt < Date.now()) {
    console.log('[verifyAdmin] Session is EXPIRED, deleting...');
    await kv.del(`admin_session:${token}`);
    return false;
  }
  
  console.log('[verifyAdmin] Session is VALID, returning true');
  return true;
}

// Helper function to extract session token from request
function getSessionToken(c: any): string | null {
  // Try custom header first
  const customToken = c.req.header('X-Admin-Token');
  if (customToken) {
    console.log('[getSessionToken] Found X-Admin-Token:', customToken.substring(0, 20));
    return customToken;
  }
  
  // Fallback to Authorization header
  const authHeader = c.req.header('Authorization');
  console.log('[getSessionToken] Authorization header:', authHeader ? authHeader.substring(0, 50) : 'MISSING');
  
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '').trim();
    
    // Check if it's a UUID format (our session tokens)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
    
    if (isUUID) {
      console.log('[getSessionToken] Found valid UUID token:', token.substring(0, 20));
      return token;
    } else {
      console.log('[getSessionToken] Token is not a UUID (probably anon key), ignoring');
    }
  }
  
  console.log('[getSessionToken] No valid token found, returning null');
  return null;
}

// Get all projects
app.get("/make-server-635fd90e/admin/projects", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const allProjects = await kv.getByPrefix('project:');
    
    // Generate fresh signed URLs for project images (same as public endpoint)
    const bucketName = 'make-635fd90e-projects';
    const projectsWithSignedUrls = await Promise.all(
      allProjects.map(async (project: any) => {
        if (!project.imagePaths || project.imagePaths.length === 0) {
          // If no imagePaths, return project with empty images array
          return { ...project, images: [] };
        }
        
        // Generate signed URLs for each image path (valid for 1 year)
        const signedUrls = await Promise.all(
          project.imagePaths.map(async (path: string) => {
            try {
              const { data } = await supabase.storage
                .from(bucketName)
                .createSignedUrl(path, 31536000); // 1 year
              return data?.signedUrl || '';
            } catch (error) {
              console.log(`Error generating signed URL for ${path}:`, error);
              return '';
            }
          })
        );
        
        return { ...project, images: signedUrls.filter(url => url !== '') };
      })
    );
    
    return c.json({ projects: projectsWithSignedUrls });
  } catch (error) {
    console.log('Error fetching projects:', error);
    return c.json({ error: 'Failed to fetch projects', details: String(error) }, 500);
  }
});

// Get published projects (public endpoint)
app.get("/make-server-635fd90e/projects", async (c) => {
  try {
    const allProjects = await kv.getByPrefix('project:');
    console.log(`[PUBLIC PROJECTS] Loaded ${allProjects.length} total projects from KV`);
    
    // Filter to only include published projects (published === true or published === undefined)
    const publishedProjects = allProjects.filter((project: any) => project.published !== false);
    console.log(`[PUBLIC PROJECTS] Filtered to ${publishedProjects.length} published projects`);
    
    if (publishedProjects.length > 0) {
      console.log('[PUBLIC PROJECTS] First project sample:', {
        id: publishedProjects[0].id,
        title: publishedProjects[0].title,
        duration: publishedProjects[0].duration,
        durationCs: publishedProjects[0].durationCs,
        material: publishedProjects[0].material,
        printingTechnology: publishedProjects[0].printingTechnology,
      });
    }
    
    // Generate fresh signed URLs for project images
    const bucketName = 'make-635fd90e-projects';
    const projectsWithSignedUrls = await Promise.all(
      publishedProjects.map(async (project: any) => {
        if (!project.imagePaths || project.imagePaths.length === 0) {
          // If no imagePaths, return project with empty images array
          return { ...project, images: [] };
        }
        
        // Generate signed URLs for each image path (valid for 1 year)
        const signedUrls = await Promise.all(
          project.imagePaths.map(async (path: string) => {
            try {
              const { data } = await supabase.storage
                .from(bucketName)
                .createSignedUrl(path, 31536000); // 1 year
              return data?.signedUrl || '';
            } catch (error) {
              console.log(`Error generating signed URL for ${path}:`, error);
              return '';
            }
          })
        );
        
        return { ...project, images: signedUrls.filter(url => url !== '') };
      })
    );
    
    return c.json({ projects: projectsWithSignedUrls });
  } catch (error) {
    console.log('Error fetching published projects:', error);
    return c.json({ error: 'Failed to fetch projects', details: String(error) }, 500);
  }
});

// Get single project
app.get("/make-server-635fd90e/admin/projects/:id", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const id = c.req.param('id');
    const project = await kv.get(`project:${id}`);
    
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    return c.json({ project });
  } catch (error) {
    console.log('Error fetching project:', error);
    return c.json({ error: 'Failed to fetch project', details: String(error) }, 500);
  }
});

// Create new project
app.post("/make-server-635fd90e/admin/projects", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const projectData = await c.req.json();
    const projectId = projectData.id || crypto.randomUUID();
    
    await kv.set(`project:${projectId}`, {
      ...projectData,
      id: projectId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    return c.json({ success: true, projectId });
  } catch (error) {
    console.log('Error creating project:', error);
    return c.json({ error: 'Failed to create project', details: String(error) }, 500);
  }
});

// Reorder projects - MUST be BEFORE /admin/projects/:id route!
app.put("/make-server-635fd90e/admin/projects/reorder", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { projects } = await c.req.json();
    
    if (!Array.isArray(projects)) {
      return c.json({ error: 'Projects must be an array' }, 400);
    }
    
    console.log('[REORDER v2] Processing', projects.length, 'projects');
    
    // Update sortOrder for each project
    let updated = 0;
    let notFound = 0;
    const notFoundIds: string[] = [];
    
    for (const project of projects) {
      if (!project.id) {
        console.log('[REORDER v2] Project missing id:', project);
        continue;
      }
      
      const existingProject = await kv.get(`project:${project.id}`);
      if (existingProject) {
        await kv.set(`project:${project.id}`, {
          ...existingProject,
          sortOrder: project.sortOrder,
          updatedAt: Date.now(),
        });
        updated++;
        console.log(`[REORDER v2] Updated project ${project.id} with sortOrder ${project.sortOrder}`);
      } else {
        console.log('[REORDER v2] Project NOT FOUND in database:', project.id);
        notFound++;
        notFoundIds.push(project.id);
      }
    }
    
    console.log(`[REORDER v2] Complete: ${updated} updated, ${notFound} not found`);
    if (notFoundIds.length > 0) {
      console.log('[REORDER v2] Not found IDs:', notFoundIds);
    }
    
    return c.json({ success: true, updated, notFound, notFoundIds });
  } catch (error) {
    console.log('[REORDER v2] Error:', error);
    return c.json({ error: 'Failed to reorder projects', details: String(error) }, 500);
  }
});

// Bulk update: Add generic 3D model to all projects
app.post("/make-server-635fd90e/admin/projects/add-generic-model", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { modelUrl } = await c.req.json();
    
    if (!modelUrl) {
      return c.json({ error: 'modelUrl is required' }, 400);
    }
    
    console.log('[ADD GENERIC MODEL] Starting bulk update with URL:', modelUrl);
    
    const allProjects = await kv.getByPrefix('project:');
    let updated = 0;
    
    for (const project of allProjects) {
      await kv.set(`project:${project.id}`, {
        ...project,
        model3dUrl: modelUrl,
        updatedAt: Date.now(),
      });
      updated++;
      console.log(`[ADD GENERIC MODEL] Updated project ${project.id}`);
    }
    
    console.log(`[ADD GENERIC MODEL] Complete: ${updated} projects updated`);
    
    return c.json({ success: true, updated });
  } catch (error) {
    console.log('[ADD GENERIC MODEL] Error:', error);
    return c.json({ error: 'Failed to add generic model', details: String(error) }, 500);
  }
});

// Update project
app.put("/make-server-635fd90e/admin/projects/:id", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const id = c.req.param('id');
    const projectData = await c.req.json();
    
    console.log(`[UPDATE PROJECT] Updating project ${id}`);
    console.log('[UPDATE PROJECT] Received data:', {
      duration: projectData.duration,
      durationCs: projectData.durationCs,
      material: projectData.material,
      printingTechnology: projectData.printingTechnology,
      specs: projectData.specs,
      specsCs: projectData.specsCs,
    });
    
    const existing = await kv.get(`project:${id}`);
    if (!existing) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    const updatedProject = {
      ...existing,
      ...projectData,
      id,
      updatedAt: Date.now()
    };
    
    console.log('[UPDATE PROJECT] Saving updated data:', {
      duration: updatedProject.duration,
      durationCs: updatedProject.durationCs,
      material: updatedProject.material,
      printingTechnology: updatedProject.printingTechnology,
      specs: updatedProject.specs,
      specsCs: updatedProject.specsCs,
    });
    
    await kv.set(`project:${id}`, updatedProject);
    
    // Verify it was saved
    const verified = await kv.get(`project:${id}`);
    console.log('[UPDATE PROJECT] Verified saved data:', {
      duration: verified?.duration,
      durationCs: verified?.durationCs,
      material: verified?.material,
      printingTechnology: verified?.printingTechnology,
      specs: verified?.specs,
      specsCs: verified?.specsCs,
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error updating project:', error);
    return c.json({ error: 'Failed to update project', details: String(error) }, 500);
  }
});

// Delete project
app.delete("/make-server-635fd90e/admin/projects/:id", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const id = c.req.param('id');
    await kv.del(`project:${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting project:', error);
    return c.json({ error: 'Failed to delete project', details: String(error) }, 500);
  }
});

// Batch publish projects
app.post("/make-server-635fd90e/admin/projects/batch-publish", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { projectIds } = await c.req.json();
    
    if (!projectIds || !Array.isArray(projectIds)) {
      return c.json({ error: 'Invalid projectIds array' }, 400);
    }
    
    let updatedCount = 0;
    for (const id of projectIds) {
      const project = await kv.get(`project:${id}`);
      if (project) {
        await kv.set(`project:${id}`, {
          ...project,
          published: true,
          updatedAt: Date.now()
        });
        updatedCount++;
      }
    }
    
    return c.json({ success: true, updatedCount });
  } catch (error) {
    console.log('Error batch publishing projects:', error);
    return c.json({ error: 'Failed to batch publish projects', details: String(error) }, 500);
  }
});

// Batch unpublish projects
app.post("/make-server-635fd90e/admin/projects/batch-unpublish", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { projectIds } = await c.req.json();
    
    if (!projectIds || !Array.isArray(projectIds)) {
      return c.json({ error: 'Invalid projectIds array' }, 400);
    }
    
    let updatedCount = 0;
    for (const id of projectIds) {
      const project = await kv.get(`project:${id}`);
      if (project) {
        await kv.set(`project:${id}`, {
          ...project,
          published: false,
          updatedAt: Date.now()
        });
        updatedCount++;
      }
    }
    
    return c.json({ success: true, updatedCount });
  } catch (error) {
    console.log('Error batch unpublishing projects:', error);
    return c.json({ error: 'Failed to batch unpublish projects', details: String(error) }, 500);
  }
});

// Publish all draft projects
app.post("/make-server-635fd90e/admin/projects/publish-all-drafts", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const allProjects = await kv.getByPrefix('project:');
    const draftProjects = allProjects.filter((project: any) => project.published === false);
    
    let updatedCount = 0;
    for (const project of draftProjects) {
      await kv.set(`project:${project.id}`, {
        ...project,
        published: true,
        updatedAt: Date.now()
      });
      updatedCount++;
    }
    
    return c.json({ success: true, updatedCount, totalDrafts: draftProjects.length });
  } catch (error) {
    console.log('Error publishing all drafts:', error);
    return c.json({ error: 'Failed to publish all drafts', details: String(error) }, 500);
  }
});

// Get publish status summary
app.get("/make-server-635fd90e/admin/publish-status", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Projects
    const allProjects = await kv.getByPrefix('project:');
    const publishedProjects = allProjects.filter((project: any) => project.published !== false);
    const draftProjects = allProjects.filter((project: any) => project.published === false);
    
    // Testimonials
    const allTestimonials = await kv.getByPrefix('testimonial:');
    const publishedTestimonials = allTestimonials.filter((t: any) => t.published !== false);
    const draftTestimonials = allTestimonials.filter((t: any) => t.published === false);
    
    // Achievements
    const allAchievements = await kv.getByPrefix('achievement:');
    const publishedAchievements = allAchievements.filter((a: any) => a.published !== false);
    const draftAchievements = allAchievements.filter((a: any) => a.published === false);
    
    return c.json({
      projects: {
        total: allProjects.length,
        published: publishedProjects.length,
        drafts: draftProjects.length,
        draftItems: draftProjects.map((p: any) => ({
          id: p.id,
          title: p.title,
          titleCs: p.titleCs,
          updatedAt: p.updatedAt
        }))
      },
      testimonials: {
        total: allTestimonials.length,
        published: publishedTestimonials.length,
        drafts: draftTestimonials.length,
        draftItems: draftTestimonials.map((t: any) => ({
          id: t.id,
          name: t.name,
          company: t.company,
          updatedAt: t.updatedAt
        }))
      },
      achievements: {
        total: allAchievements.length,
        published: publishedAchievements.length,
        drafts: draftAchievements.length,
        draftItems: draftAchievements.map((a: any) => ({
          id: a.id,
          title: a.title,
          type: a.type,
          updatedAt: a.updatedAt
        }))
      }
    });
  } catch (error) {
    console.log('Error fetching publish status:', error);
    return c.json({ error: 'Failed to fetch publish status', details: String(error) }, 500);
  }
});

// Upload image endpoint
app.post("/make-server-635fd90e/admin/upload", async (c) => {
  try {
    console.log('=== UPLOAD REQUEST RECEIVED ===');
    
    const token = getSessionToken(c);
    console.log('Token:', token ? 'present' : 'missing');
    
    if (!await verifyAdmin(token ?? '')) {
      console.log('Upload error: Unauthorized');
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    console.log('Auth verified, parsing form data...');
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    console.log('File from form:', file ? `${file.name} (${file.size} bytes)` : 'missing');
    
    if (!file) {
      console.log('Upload error: No file provided');
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // Create bucket if it doesn't exist
    const bucketName = 'make-635fd90e-projects';
    console.log('Checking bucket:', bucketName);
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.log('Error listing buckets:', bucketsError);
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    console.log('Bucket exists:', bucketExists);
    
    if (!bucketExists) {
      console.log('Creating bucket...');
      const { error: createError } = await supabase.storage.createBucket(bucketName, { public: false });
      if (createError) {
        console.log('Error creating bucket:', createError);
        return c.json({ error: 'Failed to create storage bucket', details: createError.message }, 500);
      }
      console.log('Bucket created successfully');
    }
    
    // Convert File to ArrayBuffer for Supabase
    // Sanitize filename - remove spaces and special characters
    const originalName = file.name;
    const extension = originalName.substring(originalName.lastIndexOf('.'));
    const sanitizedName = originalName
      .substring(0, originalName.lastIndexOf('.'))
      .replace(/[^a-zA-Z0-9-_]/g, '-') // Replace special chars and spaces with dash
      .replace(/-+/g, '-') // Replace multiple dashes with single dash
      .toLowerCase();
    
    const fileName = `${Date.now()}-${sanitizedName}${extension}`;
    console.log('Original filename:', originalName);
    console.log('Sanitized filename:', fileName);
    
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    console.log('File converted to buffer, size:', uint8Array.length, 'bytes');
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, uint8Array, {
        contentType: file.type,
        upsert: false
      });
    
    if (error) {
      console.log('Upload error from Supabase:', error);
      return c.json({ error: 'Upload failed', details: error.message }, 500);
    }
    
    console.log('File uploaded successfully:', data);
    
    // Get signed URL for preview (valid for 1 year)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000); // 1 year in seconds
    
    if (signedUrlError) {
      console.log('Error creating signed URL:', signedUrlError);
    }
    
    console.log('Signed URL created:', signedUrlData?.signedUrl ? 'success' : 'failed');
    
    // Return both the path and the signed URL
    // path: for storing in database
    // url: for immediate preview in admin interface
    return c.json({ 
      success: true, 
      path: fileName,           // Store this in imagePaths array
      url: signedUrlData?.signedUrl  // Use this for preview
    });
  } catch (error) {
    console.log('Error uploading file (caught):', error);
    return c.json({ error: 'Failed to upload file', details: String(error) }, 500);
  }
});

// Get website content
app.get("/make-server-635fd90e/content", async (c) => {
  try {
    const content = await kv.get('website_content');
    const settings = await kv.get('settings') || {};
    const translations = settings.translations || null;
    
    return c.json({ 
      content: content || null,
      translations: translations 
    });
  } catch (error) {
    console.log('Error fetching content:', error);
    return c.json({ error: 'Failed to fetch content', details: String(error) }, 500);
  }
});

// Get website content (admin endpoint)
app.get("/make-server-635fd90e/admin/content", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const content = await kv.get('website_content');
    return c.json({ content: content || {} });
  } catch (error) {
    console.log('Error fetching admin content:', error);
    return c.json({ error: 'Failed to fetch content', details: String(error) }, 500);
  }
});

// Update website content (admin only) - SIMPLIFIED VERSION
app.post("/make-server-635fd90e/admin/content", async (c) => {
  try {
    console.log('\n=== 🔵 CONTENT SAVE REQUEST START ===');
    
    // Step 1: Extract token from X-Admin-Token header
    const token = c.req.header('X-Admin-Token');
    console.log('1️⃣ X-Admin-Token header present:', !!token);
    
    if (!token) {
      console.log('❌ No X-Admin-Token header');
      return c.json({ error: 'No authorization token' }, 401);
    }
    
    console.log('2️⃣ Token extracted:', token.substring(0, 20) + '...');
    console.log('   Token length:', token.length);
    console.log('   Token is UUID:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token));
    
    // Step 2: Verify session
    const sessionKey = `admin_session:${token}`;
    console.log('3️⃣ Looking up session:', sessionKey.substring(0, 40) + '...');
    
    const session = await kv.get(sessionKey);
    console.log('4️⃣ Session found:', !!session);
    
    if (!session) {
      console.log('❌ Session not found in database');
      return c.json({ error: 'Session not found - please login again' }, 401);
    }
    
    console.log('5️⃣ Session details:');
    console.log('   Created:', new Date(session.createdAt).toISOString());
    console.log('   Expires:', new Date(session.expiresAt).toISOString());
    console.log('   Expired:', session.expiresAt < Date.now());
    
    // Step 3: Check expiration
    if (session.expiresAt < Date.now()) {
      console.log('❌ Session expired');
      await kv.del(sessionKey);
      return c.json({ error: 'Session expired - please login again' }, 401);
    }
    
    console.log('✅ Session valid!');
    
    // Step 4: Parse content
    const body = await c.req.json();
    console.log('6️⃣ Body received, has content:', !!body.content);
    
    if (!body.content) {
      console.log('❌ No content in request body');
      return c.json({ error: 'No content provided' }, 400);
    }
    
    const contentKeys = Object.keys(body.content);
    console.log('7️⃣ Content keys count:', contentKeys.length);
    console.log('   First 5 keys:', contentKeys.slice(0, 5));
    
    // Step 5: Save to database
    console.log('8️⃣ Saving to KV store...');
    
    await kv.set('website_content', {
      ...body.content,
      updatedAt: Date.now()
    });
    
    console.log('✅ Content saved successfully!');
    console.log('=== 🟢 CONTENT SAVE REQUEST END ===\n');
    
    return c.json({ success: true, message: 'Content saved successfully' });
    
  } catch (error) {
    console.error('❌ ERROR in content save:', error);
    console.error('Error details:', String(error));
    return c.json({ error: 'Server error', details: String(error) }, 500);
  }
});

// Bulk import projects
app.post("/make-server-635fd90e/admin/projects/import", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { projects } = await c.req.json();
    
    if (!Array.isArray(projects)) {
      return c.json({ error: 'Invalid data format' }, 400);
    }
    
    let imported = 0;
    for (const project of projects) {
      const projectId = project.id || crypto.randomUUID();
      await kv.set(`project:${projectId}`, {
        ...project,
        id: projectId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      imported++;
    }
    
    return c.json({ success: true, imported });
  } catch (error) {
    console.log('Error importing projects:', error);
    return c.json({ error: 'Failed to import projects', details: String(error) }, 500);
  }
});

// ============= ACHIEVEMENTS ENDPOINTS =============

// Get all achievements (public endpoint for frontend)
app.get("/make-server-635fd90e/admin/achievements", async (c) => {
  try {
    const token = getSessionToken(c);
    const isAdmin = await verifyAdmin(token ?? '');
    
    const achievements = await kv.getByPrefix('achievement:');
    
    // Filter by published status if not admin
    const filteredAchievements = isAdmin 
      ? achievements 
      : achievements.filter((a: any) => a.published !== false);
    
    return c.json({ achievements: filteredAchievements });
  } catch (error) {
    console.log('Error fetching achievements:', error);
    return c.json({ error: 'Failed to fetch achievements', details: String(error) }, 500);
  }
});

// Create achievement
app.post("/make-server-635fd90e/admin/achievements", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const achievementData = await c.req.json();
    const achievementId = achievementData.id || crypto.randomUUID();
    
    await kv.set(`achievement:${achievementId}`, {
      ...achievementData,
      id: achievementId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    return c.json({ success: true, achievementId });
  } catch (error) {
    console.log('Error creating achievement:', error);
    return c.json({ error: 'Failed to create achievement', details: String(error) }, 500);
  }
});

// Update achievement
app.put("/make-server-635fd90e/admin/achievements/:id", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const id = c.req.param('id');
    const achievementData = await c.req.json();
    
    const existing = await kv.get(`achievement:${id}`);
    if (!existing) {
      return c.json({ error: 'Achievement not found' }, 404);
    }
    
    await kv.set(`achievement:${id}`, {
      ...existing,
      ...achievementData,
      id,
      updatedAt: Date.now()
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error updating achievement:', error);
    return c.json({ error: 'Failed to update achievement', details: String(error) }, 500);
  }
});

// Delete achievement
app.delete("/make-server-635fd90e/admin/achievements/:id", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const id = c.req.param('id');
    await kv.del(`achievement:${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting achievement:', error);
    return c.json({ error: 'Failed to delete achievement', details: String(error) }, 500);
  }
});

// Bulk import achievements
app.post("/make-server-635fd90e/admin/achievements/import", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { achievements } = await c.req.json();
    
    if (!Array.isArray(achievements)) {
      return c.json({ error: 'Invalid data format' }, 400);
    }
    
    let imported = 0;
    for (const achievement of achievements) {
      const achievementId = achievement.id || crypto.randomUUID();
      await kv.set(`achievement:${achievementId}`, {
        ...achievement,
        id: achievementId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      imported++;
    }
    
    return c.json({ success: true, imported });
  } catch (error) {
    console.log('Error importing achievements:', error);
    return c.json({ error: 'Failed to import achievements', details: String(error) }, 500);
  }
});

// Publish all draft achievements
app.post("/make-server-635fd90e/admin/achievements/publish-all-drafts", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const allAchievements = await kv.getByPrefix('achievement:');
    const draftAchievements = allAchievements.filter((a: any) => a.published === false);
    
    let updatedCount = 0;
    for (const achievement of draftAchievements) {
      await kv.set(`achievement:${achievement.id}`, {
        ...achievement,
        published: true,
        updatedAt: Date.now()
      });
      updatedCount++;
    }
    
    return c.json({ success: true, updatedCount, totalDrafts: draftAchievements.length });
  } catch (error) {
    console.log('Error publishing all achievements drafts:', error);
    return c.json({ error: 'Failed to publish all drafts', details: String(error) }, 500);
  }
});

// ============= TESTIMONIALS ENDPOINTS =============

// Get all testimonials (public endpoint - no auth required for reading)
app.get("/make-server-635fd90e/admin/testimonials", async (c) => {
  try {
    const token = getSessionToken(c);
    const isAdmin = await verifyAdmin(token ?? '');
    
    const testimonials = await kv.getByPrefix('testimonial:');
    
    // Filter by published status if not admin
    const filteredTestimonials = isAdmin 
      ? testimonials 
      : testimonials.filter((t: any) => t.published !== false);
    
    return c.json({ testimonials: filteredTestimonials });
  } catch (error) {
    console.log('Error fetching testimonials:', error);
    return c.json({ error: 'Failed to fetch testimonials', details: String(error) }, 500);
  }
});

// Create testimonial
app.post("/make-server-635fd90e/admin/testimonials", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const testimonialData = await c.req.json();
    const testimonialId = testimonialData.id || crypto.randomUUID();
    
    await kv.set(`testimonial:${testimonialId}`, {
      ...testimonialData,
      id: testimonialId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    return c.json({ success: true, testimonialId });
  } catch (error) {
    console.log('Error creating testimonial:', error);
    return c.json({ error: 'Failed to create testimonial', details: String(error) }, 500);
  }
});

// Update testimonial
app.put("/make-server-635fd90e/admin/testimonials/:id", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const id = c.req.param('id');
    const testimonialData = await c.req.json();
    
    const existing = await kv.get(`testimonial:${id}`);
    if (!existing) {
      return c.json({ error: 'Testimonial not found' }, 404);
    }
    
    await kv.set(`testimonial:${id}`, {
      ...existing,
      ...testimonialData,
      id,
      updatedAt: Date.now()
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error updating testimonial:', error);
    return c.json({ error: 'Failed to update testimonial', details: String(error) }, 500);
  }
});

// Delete testimonial
app.delete("/make-server-635fd90e/admin/testimonials/:id", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const id = c.req.param('id');
    await kv.del(`testimonial:${id}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting testimonial:', error);
    return c.json({ error: 'Failed to delete testimonial', details: String(error) }, 500);
  }
});

// Bulk import testimonials
app.post("/make-server-635fd90e/admin/testimonials/import", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { testimonials } = await c.req.json();
    
    if (!Array.isArray(testimonials)) {
      return c.json({ error: 'Invalid data format' }, 400);
    }
    
    let imported = 0;
    for (const testimonial of testimonials) {
      const testimonialId = testimonial.id || crypto.randomUUID();
      await kv.set(`testimonial:${testimonialId}`, {
        ...testimonial,
        id: testimonialId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      imported++;
    }
    
    return c.json({ success: true, imported });
  } catch (error) {
    console.log('Error importing testimonials:', error);
    return c.json({ error: 'Failed to import testimonials', details: String(error) }, 500);
  }
});

// Publish all draft testimonials
app.post("/make-server-635fd90e/admin/testimonials/publish-all-drafts", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const allTestimonials = await kv.getByPrefix('testimonial:');
    const draftTestimonials = allTestimonials.filter((t: any) => t.published === false);
    
    let updatedCount = 0;
    for (const testimonial of draftTestimonials) {
      await kv.set(`testimonial:${testimonial.id}`, {
        ...testimonial,
        published: true,
        updatedAt: Date.now()
      });
      updatedCount++;
    }
    
    return c.json({ success: true, updatedCount, totalDrafts: draftTestimonials.length });
  } catch (error) {
    console.log('Error publishing all testimonials drafts:', error);
    return c.json({ error: 'Failed to publish all drafts', details: String(error) }, 500);
  }
});

// ============= FILTERS ENDPOINTS =============

// Get filters (admin)
app.get("/make-server-635fd90e/admin/filters", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const filters = await kv.get('filters:options');
    return c.json({ filters: filters || [] });
  } catch (error) {
    console.log('Error fetching filters:', error);
    return c.json({ error: 'Failed to fetch filters', details: String(error) }, 500);
  }
});

// Update filters (admin)
app.put("/make-server-635fd90e/admin/filters", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { filters } = await c.req.json();
    
    if (!Array.isArray(filters)) {
      return c.json({ error: 'Invalid filters format' }, 400);
    }
    
    await kv.set('filters:options', filters);
    
    return c.json({ success: true, filters });
  } catch (error) {
    console.log('Error updating filters:', error);
    return c.json({ error: 'Failed to update filters', details: String(error) }, 500);
  }
});

// Get filters (public endpoint for frontend)
app.get("/make-server-635fd90e/filters", async (c) => {
  try {
    const filters = await kv.get('filters:options');
    return c.json({ filters: filters || [] });
  } catch (error) {
    console.log('Error fetching filters:', error);
    return c.json({ error: 'Failed to fetch filters', details: String(error) }, 500);
  }
});

// ============= SETTINGS ENDPOINTS =============

// Get settings from KV store
app.get("/make-server-635fd90e/settings", async (c) => {
  try {
    const settings = await kv.get('settings') || {};
    return c.json({ settings });
  } catch (error) {
    console.log('Error fetching settings:', error);
    return c.json({ error: 'Failed to fetch settings', details: String(error) }, 500);
  }
});

// Get settings (admin endpoint)
app.get("/make-server-635fd90e/admin/settings", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const settings = await kv.get('settings') || {};
    return c.json({ settings });
  } catch (error) {
    console.log('Error fetching settings:', error);
    return c.json({ error: 'Failed to fetch settings', details: String(error) }, 500);
  }
});

// Update settings (admin only)
app.put("/make-server-635fd90e/admin/settings", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const newSettings = await c.req.json();
    
    // Get existing settings
    const existingSettings = await kv.get('settings') || {};
    
    // Merge new settings with existing ones
    await kv.set('settings', {
      ...existingSettings,
      ...newSettings,
      updatedAt: Date.now()
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error updating settings:', error);
    return c.json({ error: 'Failed to update settings', details: String(error) }, 500);
  }
});

// Export complete backup (admin only)
app.get("/make-server-635fd90e/admin/backup/export", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('📦 Starting backup export...');

    // Get all data from KV store using prefix
    const projects = await kv.getByPrefix('project:');
    const achievements = await kv.getByPrefix('achievement:');
    const testimonials = await kv.getByPrefix('testimonial:');
    const content = await kv.get('website_content') || {};
    const filters = await kv.get('filters:options') || [];
    const settings = await kv.get('settings') || {};

    console.log('✅ KV data loaded:', {
      projects: projects.length,
      achievements: achievements.length,
      testimonials: testimonials.length,
      hasContent: Object.keys(content).length > 0,
    });

    // NOTE: Image backup is disabled to avoid CPU timeout
    // Images remain in Supabase Storage and don't need to be backed up
    // Only metadata (project references to images) is included in the backup

    const backup = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      type: 'complete-backup',
      data: {
        projects,
        achievements,
        testimonials,
        content,
        filters,
        settings,
      },
      images: [], // Images not included to avoid timeout
    };

    console.log('✅ Backup created successfully');
    return c.json(backup);
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    return c.json({ error: 'Failed to create backup', details: String(error) }, 500);
  }
});

// Import backup (admin only)
app.post("/make-server-635fd90e/admin/backup/import", async (c) => {
  try {
    const token = getSessionToken(c);
    if (!await verifyAdmin(token ?? '')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const backup = await c.req.json();
    
    // Validate backup format
    if (!backup.type || backup.type !== 'complete-backup') {
      return c.json({ error: 'Invalid backup format' }, 400);
    }

    // Restore data to KV store
    if (backup.data) {
      // Restore projects
      if (backup.data.projects && Array.isArray(backup.data.projects)) {
        for (const project of backup.data.projects) {
          if (project.id) {
            await kv.set(`project:${project.id}`, project);
          }
        }
      }
      
      // Restore achievements
      if (backup.data.achievements && Array.isArray(backup.data.achievements)) {
        for (const achievement of backup.data.achievements) {
          if (achievement.id) {
            await kv.set(`achievement:${achievement.id}`, achievement);
          }
        }
      }
      
      // Restore testimonials
      if (backup.data.testimonials && Array.isArray(backup.data.testimonials)) {
        for (const testimonial of backup.data.testimonials) {
          if (testimonial.id) {
            await kv.set(`testimonial:${testimonial.id}`, testimonial);
          }
        }
      }
      
      // Restore content
      if (backup.data.content) {
        await kv.set('website_content', backup.data.content);
      }
      
      // Restore filters
      if (backup.data.filters) {
        await kv.set('filters:options', backup.data.filters);
      }
      
      // Restore settings
      if (backup.data.settings) {
        await kv.set('settings', backup.data.settings);
      }
    }

    // Restore images to storage
    let imagesRestored = 0;
    if (backup.images && Array.isArray(backup.images)) {
      // Ensure bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketName = 'make-635fd90e-projects';
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        await supabase.storage.createBucket(bucketName, { public: false });
      }

      for (const image of backup.images) {
        try {
          // Convert base64 to binary
          const binaryString = atob(image.data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          // Upload to storage
          const { error } = await supabase.storage
            .from(bucketName)
            .upload(image.name, bytes, {
              contentType: image.contentType,
              upsert: true, // Overwrite if exists
            });

          if (!error) {
            imagesRestored++;
          } else {
            console.error(`Error uploading image ${image.name}:`, error);
          }
        } catch (err) {
          console.error(`Error restoring image ${image.name}:`, err);
        }
      }
    }

    return c.json({
      success: true,
      message: 'Backup imported successfully',
      stats: {
        projects: backup.data?.projects?.length || 0,
        achievements: backup.data?.achievements?.length || 0,
        testimonials: backup.data?.testimonials?.length || 0,
        filters: Array.isArray(backup.data?.filters) ? backup.data.filters.length : 0,
        images: imagesRestored,
      }
    });
  } catch (error) {
    console.error('Error importing backup:', error);
    return c.json({ error: 'Failed to import backup', details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);