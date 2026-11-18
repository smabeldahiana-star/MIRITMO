@echo off
setlocal
set "SCRIPT_DIR=%~dp0"

if "%~1"=="" goto usage

if /I "%~1"=="start" (
  if /I "%~2"=="--all" (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%start-mcp.ps1" -All
    exit /b %errorlevel%
  )
  powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%start-mcp.ps1" -Name "%~2" %3 %4 %5 %6 %7 %8 %9
  exit /b %errorlevel%
)
if /I "%~1"=="stop" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%stop-mcp.ps1" -Name "%~2"
  exit /b %errorlevel%
)
if /I "%~1"=="status" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%status-mcp.ps1" -Name "%~2"
  exit /b %errorlevel%
)

:usage
echo Uso:
echo   mcp.cmd start ^<nombre^>
echo   mcp.cmd start --all
echo   mcp.cmd stop ^<nombre^>
echo   mcp.cmd status [nombre]
exit /b 1
