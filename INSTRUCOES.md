# Guia de Instalação e Uso - WhatsApp Bulk Sender

Este guia explica passo a passo como configurar e rodar o projeto de envio de mensagens em massa para WhatsApp.

## Pré-requisitos

*   **Node.js**: Você precisa ter o Node.js instalado no seu computador. (Recomendado versão 18 ou superior).
*   **Git**: Recomendado para clonar o repositório (ou você pode baixar os arquivos).

---

## Passo 1: Instalação das Dependências

O projeto é dividido em duas partes: `backend` (servidor) e `frontend` (interface visual). Você precisa instalar as dependências de ambos.

### 1. Configurando o Backend (Servidor)

1.  Abra o terminal (Prompt de Comando ou PowerShell).
2.  Entre na pasta `backend`:
    ```bash
    cd backend
    ```
3.  Instale as bibliotecas necessárias:
    ```bash
    npm install
    ```
    *Isso vai instalar o `express`, `whatsapp-web.js`, `socket.io`, etc.*

### 2. Configurando o Frontend (Interface)

1.  Abra **outro** terminal (ou volte para a pasta raiz `cd ..`).
2.  Entre na pasta `frontend`:
    ```bash
    cd frontend
    ```
3.  Instale as bibliotecas necessárias:
    ```bash
    npm install
    ```
    *Isso vai instalar o `react`, `vite`, etc.*

---

## Passo 2: Rodando o Projeto

Você precisa manter **dois terminais abertos**: um rodando o Backend e outro rodando o Frontend.

### Terminal 1: Rodar o Backend

1.  Certifique-se de estar na pasta `backend`.
2.  Inicie o servidor:
    ```bash
    node index.js
    ```
3.  Você verá uma mensagem como: `Server listening on port 3001`.
    *O servidor vai preparar o navegador interno para o WhatsApp. Pode demorar alguns segundos na primeira vez.*

### Terminal 2: Rodar o Frontend

1.  Certifique-se de estar na pasta `frontend`.
2.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
3.  O terminal vai mostrar um link local, geralmente: `http://localhost:5173/`.
4.  **Segure Ctrl e clique no link** ou copie e cole no seu navegador.

---

## Passo 3: Como Usar

1.  **Conectar o WhatsApp**:
    *   Ao abrir o site (`http://localhost:5173`), aguarde um momento. O Backend vai gerar um **QR Code**.
    *   Abra o WhatsApp no seu celular.
    *   Vá em **Configurações** (ou menu de três pontos) > **Aparelhos Conectados** > **Conectar um aparelho**.
    *   Escaneie o QR Code que apareceu na tela do computador.
    *   Aguarde a mensagem "Client is ready!" no terminal do backend ou a confirmação na tela.

2.  **Enviar Mensagens**:
    *   Na interface, digite ou cole os números de telefone para os quais deseja enviar mensagens.
        *   *Formato recomendado*: `5511999999999` (Código do País + DDD + Número). O sistema tenta corrigir automaticamente se faltar algo, mas o completo é mais seguro.
    *   Digite a mensagem no campo de texto.
    *   Configure o tempo de espera (Delay) se desejar (importante para evitar bloqueios).
    *   Clique em **Enviar**.

3.  **Acompanhamento**:
    *   Você verá o progresso do envio na tela (logs de sucesso ou falha).

---

## Solução de Problemas Comuns

*   **Erro de Chromium/Puppeteer**: Se o backend falhar ao abrir o navegador, pode ser necessário instalar o Chrome manualmente ou verificar as dependências do Puppeteer.
*   **QR Code não aparece**: Verifique se o backend está rodando e se não houve erro no terminal do backend. Recarregue a página do frontend.
*   **Mensagens não chegam**: Verifique se o número está correto e se o celular conectado tem internet.
