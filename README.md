# 📲 BJ Sender — Disparador de Mensagens para WhatsApp

Envie mensagens (com texto e imagem) para vários números de WhatsApp de uma vez,
por uma tela simples no navegador. Feito para ser usado **sem saber programar**.

---

## ✅ Antes de começar (só uma vez)

1. **Instale o Node.js.** Entre em **https://nodejs.org**, baixe a versão **LTS**
   e instale clicando em *Avançar / Next* até o fim.
   *(É o único programa que você precisa instalar.)*
2. **Baixe este projeto.** No GitHub, clique no botão verde **`Code`** →
   **`Download ZIP`**. Depois **extraia** o arquivo ZIP para uma pasta
   (ex.: a Área de Trabalho).

---

## ▶️ Como usar (todo dia)

### No Windows
- Abra a pasta do projeto e dê **dois cliques em `INICIAR.bat`**.

### No Linux ou Mac
- Abra a pasta no terminal e rode: `./iniciar.sh`

O que acontece depois (igual nos dois):
1. Uma **janela preta** abre e prepara tudo. *(Na primeiríssima vez ela instala
   os componentes e demora alguns minutos — é normal.)*
2. O **navegador abre sozinho** mostrando um **QR Code**.
3. No celular: **WhatsApp → Aparelhos Conectados → Conectar um aparelho** e
   **escaneie o QR Code** da tela.
4. Quando aparecer **"Online e Pronto"**, a tela de envio libera.

### Para disparar as mensagens
1. **Cole os números**, um por linha, no formato `5561999999999`
   *(código do país + DDD + número)*.
2. **Escreva a mensagem** (e, se quiser, anexe uma **imagem**).
3. Ajuste o **intervalo** entre os envios (em segundos).
4. Clique em **Iniciar Disparos** e acompanhe o resultado na coluna de logs.

> Para **encerrar** o programa, basta fechar a janela preta.

---

## ⚠️ Use com responsabilidade

O WhatsApp **pode bloquear** contas que enviam muitas mensagens em pouco tempo,
principalmente para quem não tem seu contato salvo. Para reduzir o risco:

- **Não deixe o intervalo muito baixo** (o padrão de 5 a 15 segundos é seguro).
- Evite disparar para **listas gigantes** de uma vez.
- Envie apenas para quem **espera** receber sua mensagem. Nada de spam.

Você é o responsável pelo uso desta ferramenta e pela sua conta.

---

## 🛠️ Se algo der errado

| Problema | O que fazer |
|---|---|
| A janela preta diz que **falta o Node.js** | Instale pelo https://nodejs.org e abra de novo. |
| O **QR Code não aparece** | Espere alguns segundos e atualize a página do navegador. |
| **Erro ao abrir o navegador do WhatsApp** | Instale o **Google Chrome** (https://google.com/chrome) e tente de novo. |
| As **mensagens não chegam** | Confira se o número está completo e se o celular conectado está com internet. |
| Quero **trocar de conta** | Apague a pasta `.wwebjs_auth` que fica junto do projeto e inicie de novo. |

---

## 🧩 Para quem entende de código

- Um único servidor (**Node + Express**) sobe na porta **3001** e já serve a
  interface (`public/index.html`) — não existe mais front-end separado.
- Comunicação em tempo real via **Socket.IO**; envios pelo **whatsapp-web.js**.
- Rodar manualmente: `npm install` e depois `npm start`.
- Configurações rápidas no topo do `index.js` (`PORTA` e `MOSTRAR_JANELA_INTERNA`).

Desenvolvido por **Brayan J Rodrigues**.
