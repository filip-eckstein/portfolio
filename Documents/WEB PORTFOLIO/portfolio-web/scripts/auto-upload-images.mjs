import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OPTIMIZED_DIR = path.resolve(__dirname, '../optimized-db-images');
const PROJECT_ID = "cnsezqmwmygeiypakeri";
const API_BASE = `https://${PROJECT_ID}.supabase.co/functions/v1/make-server-635fd90e`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuc2V6cW13bXlnZWl5cGFrZXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTExNDgsImV4cCI6MjA4MDg2NzE0OH0.3oI66QiCu0hlUuex4J2wIh3Zjm6WWD-cPhvl9EgR7UQ";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function login(password) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Failed to login');
  return data.token;
}

async function uploadFile(token, filePath, filename) {
  const fileData = await fs.readFile(filePath);
  const blob = new Blob([fileData], { type: 'image/webp' });
  const formData = new FormData();
  formData.append('file', blob, filename);

  const res = await fetch(`${API_BASE}/admin/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ANON_KEY}`,
      'X-Admin-Token': token
    },
    body: formData
  });
  
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data;
}

async function run() {
  console.log('\n=============================================');
  console.log('🚀 AUTOMATICKÝ NAHRÁVAČ OPTIMALIZOVANÝCH FOTEK');
  console.log('=============================================\n');

  rl.question('Zadej heslo do tvé administrace: ', async (password) => {
    rl.close();
    console.log('\nPřihlašuji se k databázi...');
    
    try {
      const token = await login(password.trim());
      console.log('✅ Úspěšně přihlášeno!');

      // Get all projects
      const res = await fetch(`${API_BASE}/admin/projects`, {
        headers: {
          'Authorization': `Bearer ${ANON_KEY}`,
          'X-Admin-Token': token
        }
      });
      const { projects } = await res.json();

      let updatedCount = 0;

      for (const project of projects) {
        if (!project.imagePaths || project.imagePaths.length === 0) continue;
        
        const safeTitle = project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const projectDir = path.join(OPTIMIZED_DIR, safeTitle);
        
        // Check if there are optimized images
        let optimizedFiles = [];
        try {
          optimizedFiles = await fs.readdir(projectDir);
        } catch (e) { continue; /* no folder */ }

        if (optimizedFiles.length === 0) continue;

        console.log(`\nAktualizuji projekt: ${project.title}`);
        
        const newImagePaths = [];
        
        // Upload each optimized image
        for (const file of optimizedFiles) {
          if (!file.endsWith('.webp')) continue;
          
          console.log(`  Nahrávám: ${file}...`);
          try {
            const uploadRes = await uploadFile(token, path.join(projectDir, file), file);
            newImagePaths.push(uploadRes.path);
            console.log(`  ✅ Nahráno úspěšně.`);
          } catch (err) {
            console.error(`  ❌ Chyba při nahrávání:`, err.message);
          }
        }

        // If we uploaded new images successfully, update the project in database
        if (newImagePaths.length > 0) {
            project.imagePaths = newImagePaths;
            
            // Delete URLs so it rebuilds them or we just pass the exact same project obj with new imagePaths
            // But we must NOT use the 'images' array because that holds Signed URLs and they are auto-generated.
            // Just update `imagePaths`!
            delete project.images;

            console.log(`  Ukládám nové obrázky k projektu do databáze...`);
            const updateRes = await fetch(`${API_BASE}/admin/projects/${project.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ANON_KEY}`,
                    'X-Admin-Token': token
                },
                body: JSON.stringify(project)
            });

            if (updateRes.ok) {
                console.log(`  ✅ Projekt "${project.title}" úspěšně aktualizován!`);
                updatedCount++;
            } else {
                console.error(`  ❌ Nelze uložit změny v databázi.`);
            }
        }
      }

      console.log('\n=============================================');
      console.log(`✨ HOTOVO! Úspěšně aktualizováno ${updatedCount} projektů.`);
      console.log('Tvůj web bude nyní načítat násobně rychleji!');
      console.log('=============================================\n');

    } catch (err) {
      console.error('\n❌ CHYBA:', err.message);
    }
  });
}

run();
