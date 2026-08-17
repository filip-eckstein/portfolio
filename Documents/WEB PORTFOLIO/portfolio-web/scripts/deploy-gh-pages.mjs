import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const buildDir = path.resolve('build');

console.log('🚀 Deploying build directory to gh-pages branch...');

// Ensure CNAME exists in build directory
fs.writeFileSync(path.join(buildDir, 'CNAME'), 'filip-eckstein.cz\n');

try {
  // Get current git remote origin URL
  const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf-8' }).trim();
  console.log('📡 Remote URL:', remoteUrl);

  const runInBuild = (cmd) => execSync(cmd, { cwd: buildDir, stdio: 'inherit' });

  // Initialize temporary git repo inside build
  runInBuild('git init');
  runInBuild('git config core.longpaths true');
  runInBuild('git add -A');
  runInBuild('git commit -m "portfolio 08/2026"');
  runInBuild(`git push -f "${remoteUrl}" HEAD:gh-pages`);

  console.log('✨ Successfully deployed to GitHub Pages (gh-pages branch)!');
} catch (error) {
  console.error('❌ Deployment error:', error?.message || error);
  process.exit(1);
}
