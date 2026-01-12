# Admin Panel Setup Guide

## Overview
Your portfolio now includes a complete admin panel at `/admin` for managing projects, uploading images, and editing content.

## Features
- 🔐 **Password Protection** - Secure login system
- 📝 **Project Management** - Add, edit, and delete projects
- 🖼️ **Image Upload** - Upload and manage project images to Supabase Storage
- 💾 **Data Persistence** - All data stored in Supabase KV store
- 📱 **Responsive Design** - Works on desktop and mobile

## Access
Navigate to: `https://your-domain.com/admin` or locally at `http://localhost:5173/admin`

## Default Password
**Default password:** `admin123`

⚠️ **IMPORTANT**: You MUST change this password in production!

## Changing the Password
1. Go to your Supabase dashboard
2. Navigate to Edge Functions → Environment Variables
3. Update the `ADMIN_PASSWORD` variable
4. Redeploy your edge function

## How to Use

### Login
1. Navigate to `/admin`
2. Enter your admin password
3. Click "Login"
4. Your session will be saved for 24 hours

### Add New Project
1. Click "Add New Project" button
2. Fill in the project details:
   - **Title** - Project name (both languages if needed)
   - **Short Description** - Brief overview
   - **Full Description** - Detailed information
   - **Category** - Project category
   - **Project Categories** - Comma-separated tags (e.g., "Education, Electronics")
   - **Date** - Project date (e.g., "June 2025")
   - **Difficulty** - Beginner, Intermediate, or Advanced
   - **Material** - Primary material used
   - **Printing Technology** - FDM or SLA
   - **Software** - Comma-separated list (e.g., "Fusion 360, PrusaSlicer")
   - **Award** - Optional award/recognition text
3. Upload images using the "Upload Image" button
4. Click "Save Project"

### Edit Existing Project
1. Find the project card
2. Click the edit (pencil) icon
3. Make your changes
4. Click "Save Project"

### Delete Project
1. Find the project card
2. Click the delete (trash) icon
3. Confirm deletion

### Upload Images
- Supported formats: JPG, PNG, GIF, WebP
- Images are stored securely in Supabase Storage
- Signed URLs are generated with 1-year validity
- You can upload multiple images per project
- Images can be removed by clicking the X button on hover

## Current State

### Existing Projects
Your existing projects are currently hardcoded in `/components/ProjectsPage.tsx`. The admin panel creates a separate database for NEW projects.

### Two Options:

**Option 1: Keep Existing Projects As Is**
- Continue using hardcoded projects
- Use admin panel only for new projects
- Manual code updates for existing projects

**Option 2: Migrate Existing Projects**
1. Manually recreate your existing projects through the admin panel
2. Upload all project images
3. Update `/components/ProjectsPage.tsx` to load from the API instead of hardcoded data

## Integration with Main Site

To display admin-managed projects on your main site, you'll need to:

1. Update `/components/ProjectsPage.tsx` to fetch projects from the API
2. Merge API projects with hardcoded projects, or fully migrate

Example API call:
```typescript
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-635fd90e/admin/projects`,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
);
const data = await response.json();
const projects = data.projects;
```

## Security Notes

1. **Password Storage**: The admin password is stored as an environment variable. For production, consider implementing proper authentication with bcrypt hashing.

2. **Session Management**: Sessions are stored in the KV store with 24-hour expiry. They're simple UUID tokens - for production, consider JWT tokens.

3. **HTTPS**: Always use HTTPS in production to protect credentials in transit.

4. **Backup**: Regularly backup your Supabase data.

## Troubleshooting

**Can't login:**
- Check that ADMIN_PASSWORD environment variable is set
- Check browser console for errors
- Try clearing localStorage and logging in again

**Images not uploading:**
- Check Supabase Storage is enabled
- Verify file size limits (default 50MB)
- Check browser console for errors

**Projects not saving:**
- Check browser console for errors
- Verify your session hasn't expired
- Check Supabase KV store quota

## Support

For issues or questions, check:
- Browser console for error messages
- Supabase dashboard logs
- Edge function logs in Supabase

## Tech Stack
- **Backend**: Supabase Edge Functions (Hono + Deno)
- **Database**: Supabase KV Store
- **Storage**: Supabase Storage (private bucket)
- **Frontend**: React + TypeScript
- **UI**: shadcn/ui components
