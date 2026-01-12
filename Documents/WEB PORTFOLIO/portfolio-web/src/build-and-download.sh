#!/bin/bash

# 🚀 Build a vytvoř ZIP pro download
# Použití: ./build-and-download.sh

set -e  # Stop on first error

echo "🚀 Building project for download..."
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

# 4. Vytvoř ZIP archiv
echo "📦 Step 4: Creating ZIP archive..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ZIP_NAME="filip-eckstein-portfolio-${TIMESTAMP}.zip"

cd dist
zip -r "../${ZIP_NAME}" .
cd ..

if [ $? -ne 0 ]; then
  echo "❌ Failed to create ZIP!"
  exit 1
fi

echo "✅ ZIP archive created!"
echo ""

# 5. Souhrn
FILE_SIZE=$(du -h "${ZIP_NAME}" | cut -f1)

echo "✨ ================================ ✨"
echo "🎉 Build complete and ready!"
echo "✨ ================================ ✨"
echo ""
echo "📦 ZIP Archive: ${ZIP_NAME}"
echo "📊 Size: ${FILE_SIZE}"
echo ""
echo "📂 What's inside:"
echo "   ✅ index.html (entry point)"
echo "   ✅ 404.html (GitHub Pages routing)"
echo "   ✅ CNAME (custom domain: filip-eckstein.cz)"
echo "   ✅ assets/ (JS, CSS, images)"
echo ""
echo "🚀 Next steps:"
echo ""
echo "Option 1 - GitHub Pages (doporučeno):"
echo "  npx gh-pages -d dist"
echo ""
echo "Option 2 - Manuální upload:"
echo "  1. Rozbal ${ZIP_NAME}"
echo "  2. Nahraj obsah na server"
echo "  3. Ujisti se, že server podporuje SPA routing"
echo ""
echo "Option 3 - FTP/NAS Server:"
echo "  1. Rozbal ${ZIP_NAME}"
echo "  2. Nahraj přes FTP/SFTP na tvůj NAS"
echo "  3. Nastav nginx podle nginx-config.txt"
echo ""
