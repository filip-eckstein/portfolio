@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 🚀 STARTING LOCAL DEV SERVER
echo ========================================
echo.
echo Server will open at: http://localhost:3000
echo.
echo Press CTRL+C to stop the server
echo.
echo ========================================
echo.

call npm run dev
