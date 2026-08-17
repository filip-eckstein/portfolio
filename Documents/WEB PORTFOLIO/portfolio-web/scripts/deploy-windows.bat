@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 🚀 DEPLOY NA GITHUB PAGES - WINDOWS
echo ========================================
echo.

REM 1. Build projektu
echo 📦 Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✅ Build complete!
echo.

REM 2. Kontrola CNAME
echo 🌐 Checking CNAME...
if not exist public\CNAME (
    echo filip-eckstein.cz > build\CNAME
)
echo ✅ CNAME ready!
echo.

REM 3. Git add, commit, push (zdrojový kód)
echo 📝 Committing changes to Git...
git add .
git commit -m "Update: Deploy to GitHub Pages with latest fixes"
if %errorlevel% neq 0 (
    echo ⚠️  Nothing to commit or commit failed
) else (
    echo ✅ Changes committed!
)
echo.

echo 🚢 Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ⚠️  Push failed - trying 'master' branch...
    git push origin master
)
echo ✅ Pushed to GitHub!
echo.

REM 4. Deploy na GitHub Pages
echo 🎯 Deploying to GitHub Pages...
npx gh-pages -d build
if %errorlevel% neq 0 (
    echo ❌ Deploy failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo ✨ DEPLOY SUCCESSFUL! ✨
echo ========================================
echo.
echo 🌍 Your site will be available at:
echo    https://filip-eckstein.cz
echo    https://filip-eckstein.cz/admin
echo.
echo ⏰ Wait 2-5 minutes for changes to appear
echo.
echo 🧪 Test URLs:
echo    ✅ https://filip-eckstein.cz/
echo    ✅ https://filip-eckstein.cz/admin
echo    ✅ https://filip-eckstein.cz/projects
echo    ✅ https://filip-eckstein.cz/achievements
echo.
pause
