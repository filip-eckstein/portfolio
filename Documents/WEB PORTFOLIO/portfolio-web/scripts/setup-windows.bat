@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 📦 PRVNÍ NASTAVENÍ PROJEKTU
echo ========================================
echo.

REM Zkontroluj, jestli je Node.js nainstalovaný
echo 🔍 Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo.
    echo Please install Node.js from:
    echo 👉 https://nodejs.org/
    echo.
    echo Download the LTS version and restart your computer.
    pause
    exit /b 1
)
echo ✅ Node.js is installed!
echo.

REM Zkontroluj, jestli je Git nainstalovaný
echo 🔍 Checking Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed!
    echo.
    echo Please install Git from:
    echo 👉 https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)
echo ✅ Git is installed!
echo.

REM Nainstaluj npm balíčky
echo 📦 Installing packages...
echo This may take 3-5 minutes...
echo.
call npm install
if %errorlevel% neq 0 (
    echo ❌ Installation failed!
    pause
    exit /b 1
)
echo.
echo ✅ All packages installed!
echo.

echo ========================================
echo ✨ SETUP COMPLETE! ✨
echo ========================================
echo.
echo 🎯 You can now deploy your site!
echo.
echo To deploy, double-click:
echo    📄 deploy-windows.bat
echo.
echo Or to test locally first:
echo    📄 start-dev.bat
echo.
pause
