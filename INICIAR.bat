@echo off
chcp 65001 >nul
title BJ Sender - Disparador de WhatsApp
cd /d "%~dp0"

REM Se receber o parametro "oculto", nao para para o usuario apertar tecla
REM (usado pelo iniciar-oculto.vbs, que roda sem janela).
set "MODO=%~1"

echo ============================================
echo    BJ Sender - Disparador de WhatsApp
echo ============================================
echo.

REM ============================================================
REM 1) Procura um navegador ja instalado (Chrome, Edge ou Brave)
REM    O Edge vem em todo Windows, entao quase sempre acha um.
REM ============================================================
set "BJ_BROWSER_PATH="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "BJ_BROWSER_PATH=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined BJ_BROWSER_PATH if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "BJ_BROWSER_PATH=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not defined BJ_BROWSER_PATH if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "BJ_BROWSER_PATH=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not defined BJ_BROWSER_PATH if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "BJ_BROWSER_PATH=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not defined BJ_BROWSER_PATH if exist "%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe" set "BJ_BROWSER_PATH=%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe"

REM Se achamos um navegador, mandamos NAO baixar o Chromium (economiza download).
if not defined BJ_BROWSER_PATH goto sem_navegador
echo Navegador encontrado - o Chromium nao precisara ser baixado.
set "PUPPETEER_SKIP_DOWNLOAD=true"
set "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true"
goto fim_navegador
:sem_navegador
echo Nenhum navegador encontrado. Sera usado o Chromium interno.
:fim_navegador
echo.

REM ============================================================
REM 2) Verifica o Node.js. Se faltar, tenta instalar sozinho.
REM ============================================================
where node >nul 2>nul
if not errorlevel 1 goto node_ok

echo [SETUP] Node.js nao encontrado. Tentando instalar automaticamente...
echo.

REM Plano A: winget (existe na maioria dos Windows 10/11)
where winget >nul 2>nul
if not errorlevel 1 (
    winget install -e --id OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements
    goto pos_install_node
)

REM Plano B: baixa o instalador oficial e abre (basta clicar em Avancar/Next)
echo winget indisponivel. Baixando o instalador do Node.js...
echo Quando a tela de instalacao abrir, clique em Next ate o fim.
powershell -NoProfile -Command "$u='https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi'; $o=Join-Path $env:TEMP 'node-lts.msi'; try { Invoke-WebRequest -Uri $u -OutFile $o -UseBasicParsing; Start-Process $o -Wait } catch { exit 1 }"

:pos_install_node
REM Deixa o Node visivel nesta janela sem precisar reabrir
set "PATH=%PATH%;%ProgramFiles%\nodejs;%ProgramFiles(x86)%\nodejs"
where node >nul 2>nul
if errorlevel 1 (
    echo.
    echo [ATENCAO] Nao consegui instalar o Node.js automaticamente.
    echo Instale a versao LTS manualmente em: https://nodejs.org
    echo Depois abra este arquivo novamente.
    echo.
    if /i not "%MODO%"=="oculto" pause
    exit /b
)
echo Node.js instalado com sucesso!
echo.

:node_ok

REM ============================================================
REM 3) Na primeira vez, instala os componentes do projeto.
REM ============================================================
if not exist "node_modules" (
    echo Primeira vez rodando: instalando os componentes.
    echo Isso pode demorar alguns minutos. Aguarde...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERRO] A instalacao falhou. Verifique a internet e tente de novo.
        echo.
        if /i not "%MODO%"=="oculto" pause
        exit /b
    )
    echo.
)

REM ============================================================
REM 4) Sobe o servidor. O navegador abre sozinho na tela do QR.
REM ============================================================
echo Iniciando... o navegador vai abrir sozinho em instantes.
echo Para ENCERRAR, feche esta janela (ou use o PARAR.bat).
echo.
call npm start

if /i not "%MODO%"=="oculto" pause
