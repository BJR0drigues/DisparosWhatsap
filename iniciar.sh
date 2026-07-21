#!/usr/bin/env bash
# ============================================================
#  BJ Sender - Disparador de WhatsApp (Linux/Mac)
#  Criado por Brayan J Rodrigues (github.com/BJR0drigues)
#  (c) 2026 Brayan J Rodrigues. Todos os direitos reservados.
# ============================================================
# Uso: dê dois cliques (ou rode ./iniciar.sh no terminal).

cd "$(dirname "$0")" || exit 1

echo "============================================"
echo "   BJ Sender - Disparador de WhatsApp"
echo "   Criado por Brayan J Rodrigues"
echo "============================================"
echo

# 1) Verifica se o Node.js está instalado
if ! command -v node >/dev/null 2>&1; then
    echo "[ATENCAO] O Node.js não foi encontrado."
    echo "Instale a versão LTS em: https://nodejs.org"
    echo "Depois rode este arquivo novamente."
    read -r -p "Pressione Enter para sair..."
    exit 1
fi

# 2) Na primeira vez, instala os componentes necessários
if [ ! -d "node_modules" ]; then
    echo "Primeira vez rodando: instalando os componentes (pode demorar)..."
    echo
    npm install || { echo "[ERRO] Instalação falhou. Verifique a internet."; exit 1; }
    echo
fi

# 3) Sobe o servidor (o navegador abre sozinho)
echo "Iniciando... o navegador vai abrir sozinho."
echo "Para encerrar, pressione Ctrl+C ou feche esta janela."
echo
npm start
