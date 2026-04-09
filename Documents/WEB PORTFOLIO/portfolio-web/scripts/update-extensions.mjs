import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, '../src');

async function updateExtensions(dir) {
  const files = await fs.readdir(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      await updateExtensions(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
      let content = await fs.readFile(fullPath, 'utf-8');
      
      // Replace .png with .webp for local assets
      // Matches things like figma:asset/...png, ./assets/...png, etc.
      // But tries to be careful not to match random strings
      const updatedContent = content.replace(/\.png\b/g, '.webp');
      
      if (content !== updatedContent) {
        await fs.writeFile(fullPath, updatedContent, 'utf-8');
        console.log(`Updated: ${path.relative(SRC_DIR, fullPath)}`);
      }
    }
  }
}

console.log('🚀 Updating file extensions in src...');
updateExtensions(SRC_DIR).then(() => console.log('✨ All files updated!'));
