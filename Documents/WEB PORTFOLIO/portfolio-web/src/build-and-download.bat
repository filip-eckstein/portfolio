@echo off
REM 🚀 Build script pro Windows
REM Použití: Dvojklik nebo příkaz: build-and-download.bat

echo ========================================
echo 🚀 Building Filip Eckstein Portfolio
echo ========================================
echo.

REM 1. Build projektu
echo 📦 Step 1: Building React app...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo ✅ Build complete!
echo.

REM 2. Zkopíruj 404.html
echo 📄 Step 2: Copying 404.html to dist...
copy /Y 404.html dist\404.html

if %errorlevel% neq 0 (
    echo ❌ Failed to copy 404.html!
    pause
    exit /b 1
)

echo ✅ 404.html copied!
echo.

REM 3. Vytvoř CNAME
echo 🌐 Step 3: Creating CNAME file...
echo filip-eckstein.cz > dist\CNAME

if %errorlevel% neq 0 (
    echo ❌ Failed to create CNAME!
    pause
    exit /b 1
)

echo ✅ CNAME created!
echo.

REM 4. Vytvoř ZIP (pokud máš PowerShell)
echo 📦 Step 4: Creating ZIP archive...

REM Získej timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/: " %%a in ('time /t') do (set mytime=%%a%%b)
set ZIP_NAME=filip-eckstein-portfolio-%mydate%_%mytime%.zip

REM Použij PowerShell k vytvoření ZIP
powershell -command "Compress-Archive -Path dist\* -DestinationPath %ZIP_NAME% -Force"

if %errorlevel% neq 0 (
    echo ⚠️  ZIP creation failed - není problém!
    echo 📂 Build je ve složce: dist\
    echo.
) else (
    echo ✅ ZIP archive created: %ZIP_NAME%
    echo.
)

REM 5. Souhrn
echo ========================================
echo ✨ Build complete!
echo ========================================
echo.
echo 📂 Build folder: dist\
if exist %ZIP_NAME% (
    echo 📦 ZIP Archive: %ZIP_NAME%
)
echo.
echo 🚀 Next steps:
echo.
echo   Option 1 - GitHub Pages:
echo     npx gh-pages -d dist
echo.
echo   Option 2 - Manual upload:
if exist %ZIP_NAME% (
    echo     1. Unzip %ZIP_NAME%
) else (
    echo     1. Upload dist\ folder
)
echo     2. Upload to your server
echo.
echo   Option 3 - NAS Server:
if exist %ZIP_NAME% (
    echo     1. Unzip %ZIP_NAME%
) else (
    echo     1. Copy dist\ folder
)
echo     2. Upload via FTP/SFTP
echo     3. Configure nginx (see nginx-config.txt)
echo.
echo ========================================
echo.
pause
