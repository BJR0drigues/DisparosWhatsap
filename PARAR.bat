@echo off
chcp 65001 >nul
title Parar BJ Sender
cd /d "%~dp0"

echo Encerrando o BJ Sender...
taskkill /IM node.exe /F >nul 2>nul
if errorlevel 1 (
    echo Nada estava rodando.
) else (
    echo Pronto, o BJ Sender foi encerrado.
)

timeout /t 2 >nul
