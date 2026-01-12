#!/bin/bash

# 🚀 Build script pro GitHub Pages
# Tento script připraví kompletní build pro nasazení na GitHub Pages

echo "🔨 Building project for GitHub Pages..."
echo ""

# 1. Build projektu
echo "📦 Step 1: Building React app..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo "✅ Build complete!"
echo ""

# 2. Zkopíruj 404.html do dist
echo "📄 Step 2: Copying 404.html to dist..."
cp 404.html dist/404.html

if [ $? -ne 0 ]; then
  echo "❌ Failed to copy 404.html!"
  exit 1
fi

echo "✅ 404.html copied!"
echo ""

# 3. Vytvoř CNAME soubor
echo "🌐 Step 3: Creating CNAME file..."
echo "filip-eckstein.cz" > dist/CNAME

if [ $? -ne 0 ]; then
  echo "❌ Failed to create CNAME!"
  exit 1
fi

echo "✅ CNAME created!"
echo ""

# 4. Souhrn
echo "✨ Build ready for GitHub Pages!"
echo ""
echo "📂 Files in dist:"
ls -lh dist/ | grep -E "(404.html|CNAME|index.html)"
echo ""
echo "🚀 Next steps:"
echo "  1. Push to GitHub: git add . && git commit -m 'Deploy' && git push"
echo "  2. Or use gh-pages: npx gh-pages -d dist"
echo ""
echo "🌍 Your site will be available at: https://filip-eckstein.cz"
echo ""
