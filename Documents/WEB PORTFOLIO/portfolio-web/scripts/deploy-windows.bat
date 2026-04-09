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

REM 2. Zkopíruj 404.html do dist
echo 📄 Copying 404.html...
copy /Y 404.html dist\404.html >nul
if %errorlevel% neq 0 (
    echo ❌ Failed to copy 404.html!
    pause
    exit /b 1
)
echo ✅ 404.html copied!
echo.

REM 3. Vytvoř CNAME pro vlastní doménu
echo 🌐 Creating CNAME...
echo filip-eckstein.cz > dist\CNAME
if %errorlevel% neq 0 (
    echo ❌ Failed to create CNAME!
    pause
    exit /b 1
)
echo ✅ CNAME created!
echo.

REM 4. Git add, commit, push (zdrojový kód)
echo 📝 Committing changes to Git...
git add .
git commit -m "Update: Fixed GitHub Pages routing for /admin on filip-eckstein.cz"
if %errorlevel% neq 0 (
    echo ⚠️  Nothing to commit or commit failed
    echo    (This is OK if no changes were made)
) else (
    echo ✅ Changes committed!
)
echo.

echo 🚢 Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ⚠️  Push failed - trying 'master' branch...
    git push origin master
    if %errorlevel% neq 0 (
        echo ❌ Push failed! Check your Git configuration.
        pause
        exit /b 1
    )
)
echo ✅ Pushed to GitHub!
echo.

REM 5. Deploy na GitHub Pages
echo 🎯 Deploying to GitHub Pages...
npx gh-pages -d dist
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
