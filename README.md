# 📲 BJ Sender — Disparador de Mensagens para WhatsApp

Envie mensagens (com texto e imagem) para vários números de WhatsApp de uma vez,
por uma tela simples no navegador. Feito para ser usado **sem saber programar**.

---

## ✅ Antes de começar (só uma vez)

1. **Baixe este projeto.** No GitHub, clique no botão verde **`Code`** →
   **`Download ZIP`**. Depois **extraia** o arquivo ZIP para uma pasta
   (ex.: a Área de Trabalho).
2. Pronto. **Você não precisa instalar mais nada.** Na primeira execução o
   programa tenta baixar sozinho o que faltar (o Node.js) e usa um navegador
   que você já tem (Edge, Chrome ou Brave) — sem baixar o Chromium.

> Se o computador for muito travado e a instalação automática do Node.js não
> funcionar, instale-o manualmente pela versão **LTS** em **https://nodejs.org**
> e rode de novo.

---

## ▶️ Como usar (todo dia)

### No Windows — escolha um jeito
- **Sem janela preta (recomendado):** dê **dois cliques em `iniciar-oculto.vbs`**.
  Aparece só um aviso rápido e depois o navegador abre sozinho.
- **Vendo o que acontece:** dê **dois cliques em `INICIAR.bat`** (mostra o
  progresso numa janela preta — bom na primeira vez ou pra resolver problemas).

Para **encerrar** depois, dê dois cliques em **`PARAR.bat`**.

### No Linux ou Mac
- Abra a pasta no terminal e rode: `./iniciar.sh` *(encerra com `Ctrl+C`)*.

O que acontece depois:
1. Na **primeiríssima vez**, o programa instala o que precisa (pode demorar
   alguns minutos — é normal).
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
| Rodei o `.vbs` e **nada apareceu** | Rode o **`INICIAR.bat`** (janela preta) pra ver a mensagem de erro. |
| Diz que **falta o Node.js** e não instalou sozinho | Instale a versão LTS em https://nodejs.org e abra de novo. |
| O **QR Code não aparece** | Espere alguns segundos e atualize a página do navegador. |
| **Erro ao abrir o navegador do WhatsApp** | Instale o **Microsoft Edge** ou o **Google Chrome** e tente de novo. |
| As **mensagens não chegam** | Confira se o número está completo e se o celular conectado está com internet. |
| Quero **trocar de conta** | Encerre com o `PARAR.bat`, apague a pasta `.wwebjs_auth` e inicie de novo. |

---

## 🧪 Modo de teste (sem WhatsApp de verdade)

Quer só **ver a tela funcionando** sem conectar celular nem correr risco de bloqueio?
Existe um modo que **simula** os envios (mostra progresso e logs de mentira).

- **Linux/Mac:** rode `./teste-linux.sh`
- **Qualquer sistema:** `node index.js --teste` (ou defina `BJ_TESTE=1`)

Ele sobe a interface, entra direto como "Online e Pronto" (sem QR Code) e, ao
clicar em **Iniciar Disparos**, finge enviar para os números com ~85% de sucesso.
Ótimo para demonstrar ou testar mudanças na tela.

---

## 🧩 Para quem entende de código

- Um único servidor (**Node + Express**) sobe na porta **3001** e já serve a
  interface (`public/index.html`) — não existe mais front-end separado.
- Comunicação em tempo real via **Socket.IO**; envios pelo **whatsapp-web.js**.
- O `puppeteer` é apontado para um navegador do sistema (Chrome/Edge/Brave);
  o lançador exporta `BJ_BROWSER_PATH` e liga `PUPPETEER_SKIP_DOWNLOAD` para
  **não baixar o Chromium**. Sem navegador detectado, cai no Chromium interno.
- Rodar manualmente: `npm install` e depois `npm start`.
- Configurações rápidas no topo do `index.js` (`PORTA` e `MOSTRAR_JANELA_INTERNA`).
- Arquivos: `iniciar-oculto.vbs` (Windows sem janela), `INICIAR.bat` (Windows
  com janela / auto-instala Node), `PARAR.bat` (encerra), `iniciar.sh` (Linux/Mac).

Desenvolvido por **Brayan J Rodrigues**.
