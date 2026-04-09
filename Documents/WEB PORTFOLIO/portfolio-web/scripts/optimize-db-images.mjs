import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../optimized-db-images');
const PROJECT_ID = "cnsezqmwmygeiypakeri";
const API_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/make-server-635fd90e/projects`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuc2V6cW13bXlnZWl5cGFrZXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTExNDgsImV4cCI6MjA4MDg2NzE0OH0.3oI66QiCu0hlUuex4J2wIh3Zjm6WWD-cPhvl9EgR7UQ";

// Helper to download image
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download, status code: ${res.statusCode}`));
        return;
      }
      
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function optimizeSupabaseImages() {
  try {
    // 1. Create output dir
    try {
      await fs.mkdir(OUT_DIR, { recursive: true });
    } catch (e) {}

    console.log('Fetching projects from database...');
    // 2. Fetch projects
    const response = await fetch(API_URL, {
        headers: {
            'Authorization': `Bearer ${ANON_KEY}`
        }
    });
    const data = await response.json();
    const projects = data.projects || [];

    console.log(`Found ${projects.length} projects. Analyzing images...`);

    // 3. Process images
    let totalImages = 0;
    let totalOriginalBytes = 0;
    let totalNewBytes = 0;

    for (const project of projects) {
        if (!project.images || project.images.length === 0) continue;
        
        console.log(`\nProcessing project: ${project.title}`);
        
        // Create project subfolder
        const safeTitle = project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const projectDir = path.join(OUT_DIR, safeTitle);
        try {
          await fs.mkdir(projectDir, { recursive: true });
        } catch (e) {}

        for (let i = 0; i < project.images.length; i++) {
          const url = project.images[i];
          const filename = url.split('/').pop().split('?')[0] || `image_${i}.jpg`;
          const baseName = path.basename(filename, path.extname(filename));
          const webpFilename = `${baseName}_optimized.webp`;
          const outputPath = path.join(projectDir, webpFilename);

          try {
            console.log(`  Downloading ${filename}...`);
            const imageBuffer = await downloadImage(url);
            totalOriginalBytes += imageBuffer.length;

            console.log(`  Optimizing ${filename}...`);
            let pipeline = sharp(imageBuffer);
            const metadata = await pipeline.metadata();

            // Resize if width > 1200
            if (metadata.width && metadata.width > 1200) {
                pipeline = pipeline.resize(1200);
            }

            // Convert to WebP
            await pipeline
                .webp({ quality: 80, effort: 6 })
                .toFile(outputPath);

            const newSize = (await fs.stat(outputPath)).size;
            totalNewBytes += newSize;
            totalImages++;

            const origMb = (imageBuffer.length / 1024 / 1024).toFixed(2);
            const newMb = (newSize / 1024 / 1024).toFixed(2);
            console.log(`  ✅ Saved as ${webpFilename} (${origMb}MB -> ${newMb}MB)`);

          } catch (err) {
            console.error(`  ❌ Error processing ${filename}:`, err.message);
          }
        }
    }

    console.log('\n=============================================');
    console.log('✨ ALL PROJECT IMAGES OPTIMIZED SUCCESSFULLY! ✨');
    console.log('=============================================');
    console.log(`Total images processed: ${totalImages}`);
    console.log(`Total original size: ${(totalOriginalBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total new size: ${(totalNewBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total savings: ${((totalOriginalBytes - totalNewBytes) / 1024 / 1024).toFixed(2)} MB!`);
    console.log(`\nYou can find all your optimized WebP images in this folder:`);
    console.log(OUT_DIR);

  } catch (err) {
    console.error('Fatal Error:', err);
  }
}

optimizeSupabaseImages();
