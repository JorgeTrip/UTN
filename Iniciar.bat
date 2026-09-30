@echo off
chcp 65001 > nul
title Panel Académico UTN FRBA - Servidor Local

cd /d "%~dp0"

echo =======================================================
echo    PANEL ACADEMICO ISI - UTN FRBA - Servidor Local
echo =======================================================
echo.

set PUERTO=8080
if not "%~1"=="" set PUERTO=%~1

:: Liberar puerto si ya esta en uso
for /f "tokens=5" %%p in ('netstat -aon 2^>nul ^| findstr ":%PUERTO% "') do (
    taskkill /F /PID %%p >nul 2>&1
)

echo   [PC Local]  : http://localhost:%PUERTO%

python -c "import socket; s=socket.socket(socket.AF_INET,socket.SOCK_DGRAM); s.connect(('8.8.8.8',80)); print('  [Red Wi-Fi] : http://' + s.getsockname()[0] + ':%PUERTO%'); s.close()" 2>nul

echo.
echo =======================================================
echo   Abre la aplicacion en tu navegador o celular
echo =======================================================
echo.

start "" "http://localhost:%PUERTO%"

python -m http.server -b 0.0.0.0 %PUERTO%

if errorlevel 1 (
    echo.
    echo [ERROR] No se pudo iniciar el servidor con Python.
    pause
)
