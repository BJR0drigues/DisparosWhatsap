@echo off
chcp 65001 >nul
title BJ Sender - Disparador de WhatsApp
cd /d "%~dp0"

echo ============================================
echo    BJ Sender - Disparador de WhatsApp
echo ============================================
echo.

REM 1) Verifica se o Node.js esta instalado
where node >nul 2>nul
if errorlevel 1 (
    echo [ATENCAO] O Node.js nao foi encontrado no seu computador.
    echo.
    echo Baixe e instale a versao LTS em: https://nodejs.org
    echo Depois de instalar, feche e abra este arquivo novamente.
    echo.
    pause
    exit /b
)

REM 2) Na primeira vez, instala os componentes necessarios
if not exist "node_modules" (
    echo Primeira vez rodando: instalando os componentes.
    echo Isso pode demorar alguns minutos. Aguarde...
    echo.
    call npm install
    echo.
    if errorlevel 1 (
        echo [ERRO] A instalacao falhou. Verifique sua conexao com a internet
        echo e tente abrir este arquivo de novo.
        echo.
        pause
        exit /b
    )
)

REM 3) Sobe o servidor. O navegador abre sozinho na tela do QR Code.
echo Iniciando... o navegador vai abrir sozinho em instantes.
echo Para ENCERRAR o programa, feche esta janela preta.
echo.
call npm start

pause
