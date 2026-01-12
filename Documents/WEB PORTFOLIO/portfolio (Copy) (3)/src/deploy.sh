#!/bin/bash

# 🚀 Automatický deploy na GitHub Pages s jedním příkazem
# Použití: ./deploy.sh

set -e  # Stop on first error

echo "🚀 Deploying to GitHub Pages..."
echo ""

# 1. Build projektu
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo "✅ Build complete!"
echo ""

# 2. Zkopíruj 404.html
echo "📄 Copying 404.html to dist..."
cp 404.html dist/404.html

if [ $? -ne 0 ]; then
  echo "❌ Failed to copy 404.html!"
  exit 1
fi

echo "✅ 404.html copied!"
echo ""

# 3. Vytvoř CNAME
echo "🌐 Creating CNAME..."
echo "filip-eckstein.cz" > dist/CNAME

if [ $? -ne 0 ]; then
  echo "❌ Failed to create CNAME!"
  exit 1
fi

echo "✅ CNAME created!"
echo ""

# 4. Deploy na GitHub Pages
echo "🚢 Deploying to GitHub Pages..."
npx gh-pages -d dist

if [ $? -ne 0 ]; then
  echo "❌ Deploy failed!"
  exit 1
fi

echo ""
echo "✨ ================================ ✨"
echo "🎉 Deploy successful!"
echo "✨ ================================ ✨"
echo ""
echo "🌍 Your site will be available at:"
echo "   https://filip-eckstein.cz"
echo ""
echo "⏰ Wait 2-5 minutes for changes to appear"
echo ""
echo "🧪 Test these URLs:"
echo "   ✅ https://filip-eckstein.cz/"
echo "   ✅ https://filip-eckstein.cz/admin"
echo "   ✅ https://filip-eckstein.cz/projects"
echo "   ✅ https://filip-eckstein.cz/achievements"
echo ""
