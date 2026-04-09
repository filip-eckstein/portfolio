import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.resolve(__dirname, '../src/assets');

async function optimizeImages() {
  const files = await fs.readdir(ASSETS_DIR);
  const pngFiles = files.filter(f => f.endsWith('.png'));

  console.log(`🚀 Starting optimization of ${pngFiles.length} images...`);

  for (const file of pngFiles) {
    const inputPath = path.join(ASSETS_DIR, file);
    const outputPath = path.join(ASSETS_DIR, file.replace('.png', '.webp'));

    try {
      const metadata = await sharp(inputPath).metadata();
      const originalSize = (await fs.stat(inputPath)).size;

      let pipeline = sharp(inputPath);

      // Resize if too wide (max 1920px for high quality, lower for others)
      // Most of these are likely screenshots or photos
      if (metadata.width && metadata.width > 2560) {
        pipeline = pipeline.resize(2560);
      }

      await pipeline
        .webp({ quality: 80, effort: 6 })
        .toFile(outputPath);

      const newSize = (await fs.stat(outputPath)).size;
      const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);

      console.log(`✅ ${file} -> ${path.basename(outputPath)} (${reduction}% reduction: ${(originalSize / 1024 / 1024).toFixed(2)}MB -> ${(newSize / 1024 / 1024).toFixed(2)}MB)`);
      
      // Optionally remove the original png if we are confident (we will do it after verification)
      // await fs.unlink(inputPath);
    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err);
    }
  }

  console.log('✨ Image optimization complete!');
}

optimizeImages();
