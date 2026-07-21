#!/usr/bin/env bash
# ============================================================
#  BJ Sender - MODO DE TESTE (Linux/Mac)
#  Sobe a interface e SIMULA os envios, sem conectar no
#  WhatsApp de verdade. Serve para testar a tela sem celular,
#  sem conta e sem risco de bloqueio.
#  Uso: ./teste-linux.sh   (encerra com Ctrl+C)
# ============================================================
cd "$(dirname "$0")" || exit 1

echo "============================================"
echo "   BJ Sender - MODO DE TESTE"
echo "   (nada e enviado de verdade)"
echo "============================================"
echo

if ! command -v node >/dev/null 2>&1; then
    echo "[ATENCAO] Node.js nao encontrado. Instale a versao LTS em https://nodejs.org"
    exit 1
fi

# No modo de teste nao usamos o Chromium; pulamos o download para instalar mais rapido.
export PUPPETEER_SKIP_DOWNLOAD=true
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

if [ ! -d node_modules ]; then
    echo "Instalando componentes (primeira vez)..."
    echo
    npm install || { echo "[ERRO] Instalacao falhou. Verifique a internet."; exit 1; }
    echo
fi

# Liga o modo de teste e sobe o servidor (o navegador abre sozinho).
export BJ_TESTE=1
npm start
