// BJ Sender - Disparador de mensagens em massa para WhatsApp
// Um único programa: sobe o servidor E serve a interface no navegador.

const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { exec } = require('child_process');
const { Server } = require('socket.io');
const qrcode = require('qrcode');

// ===== Configurações principais (mude aqui se precisar) =====
const PORTA = 3001;
// Deixe false para NÃO mostrar a janela do navegador interno do WhatsApp.
// Coloque true só se precisar depurar algum problema de conexão.
const MOSTRAR_JANELA_INTERNA = false;
// MODO DE TESTE: não conecta no WhatsApp de verdade, apenas SIMULA os envios.
// Serve para testar a interface sem celular/conta e sem risco de bloqueio.
// Ativa com a variável BJ_TESTE=1 ou rodando: node index.js --teste
const MODO_TESTE = process.env.BJ_TESTE === '1' || process.argv.includes('--teste');
// Onde fica o histórico de campanhas (modo Registro da interface).
const ARQ_HISTORICO = path.join(__dirname, 'historico.json');
// Quantas campanhas guardar no histórico (as mais antigas são descartadas).
const LIMITE_HISTORICO = 100;

const app = express();
const servidor = http.createServer(app);
const io = new Server(servidor, { cors: { origin: '*' } });

// A interface (public/index.html) é servida pelo próprio servidor.
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ===== Descobre um navegador já instalado no computador =====
// Prioridade: o caminho que o lançador (INICIAR.bat) já encontrou e passou
// pela variável BJ_BROWSER_PATH; senão, procura Chrome, Edge (vem em todo
// Windows) ou Brave nos lugares mais comuns. Se não achar nenhum, retorna
// undefined e o whatsapp-web.js usa o Chromium interno que ele baixa.
function acharNavegador() {
    if (process.env.BJ_BROWSER_PATH && fs.existsSync(process.env.BJ_BROWSER_PATH)) {
        return process.env.BJ_BROWSER_PATH;
    }
    const candidatos = [
        // Google Chrome
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        // Microsoft Edge (presente em todo Windows 10/11)
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        // Brave
        'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
        // Mac
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
        // Linux
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/microsoft-edge',
        '/usr/bin/brave-browser',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
    ];
    return candidatos.find((caminho) => fs.existsSync(caminho)) || undefined;
}

// ===== Estado atual da conexão (o navegador consulta isso em /status) =====
let isReady = false;
let isAuthenticated = false;
let qrCodeUrl = null;
let loadingPercent = 0;
let loadingMessage = 'Inicializando...';
// Campanha em andamento (null quando não há nenhuma). Vai no /status para a
// interface conseguir retomar o acompanhamento se a página for recarregada.
let campanhaAtual = null;

// Só carregados quando NÃO estamos em modo de teste (require preguiçoso).
let client = null;
let MessageMedia = null;

// ===== Histórico de campanhas (modo Registro) =====

function carregarHistorico() {
    try {
        return JSON.parse(fs.readFileSync(ARQ_HISTORICO, 'utf8'));
    } catch {
        return []; // arquivo ainda não existe (ou está corrompido): começa vazio
    }
}

function salvarHistorico(historico) {
    try {
        fs.writeFileSync(ARQ_HISTORICO, JSON.stringify(historico, null, 2));
    } catch (err) {
        console.error('Não foi possível salvar o histórico:', err.message);
    }
}

// ===== Liga o WhatsApp de verdade (fora do modo de teste) =====
function iniciarWhatsApp() {
    // Carrega a biblioteca pesada só aqui, quando realmente vamos usá-la.
    const wweb = require('whatsapp-web.js');
    MessageMedia = wweb.MessageMedia;

    client = new wweb.Client({
        authStrategy: new wweb.LocalAuth(), // salva a sessão (não pede QR toda vez)
        puppeteer: {
            headless: !MOSTRAR_JANELA_INTERNA,
            executablePath: acharNavegador(), // undefined = usa o Chromium interno
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
            ],
        },
    });

    client.on('qr', async (qr) => {
        console.log('>> QR Code recebido. Escaneie na tela do navegador.');
        isAuthenticated = false;
        loadingMessage = 'Escaneie o QR Code';
        loadingPercent = 0;
        try {
            qrCodeUrl = await qrcode.toDataURL(qr);
            io.emit('qr', qrCodeUrl);
            io.emit('loading_screen', { percent: 0, message: 'Escaneie o QR Code' });
        } catch (err) {
            console.error('Erro ao gerar a imagem do QR Code:', err);
        }
    });

    client.on('ready', () => {
        console.log('>> WhatsApp conectado e pronto para enviar!');
        isReady = true;
        isAuthenticated = true;
        qrCodeUrl = null;
        io.emit('ready');
    });

    client.on('authenticated', () => {
        console.log('>> Autenticado. Sincronizando conversas...');
        isAuthenticated = true;
        qrCodeUrl = null;
        io.emit('authenticated');

        loadingMessage = 'Autenticado. Aguardando o WhatsApp carregar...';
        loadingPercent = 10;
        io.emit('loading_screen', { percent: loadingPercent, message: loadingMessage });

        // Às vezes o evento "ready" não dispara sozinho; forçamos após 8s.
        setTimeout(() => {
            if (!isReady) {
                console.log('>> Forçando estado "pronto" após autenticação.');
                isReady = true;
                qrCodeUrl = null;
                io.emit('ready');
            }
        }, 8000);
    });

    client.on('loading_screen', (percent, message) => {
        loadingPercent = percent;
        loadingMessage = message;
        io.emit('loading_screen', { percent, message });
    });

    client.on('change_state', (state) => {
        loadingMessage = `Estado: ${state}`;
        io.emit('loading_screen', { percent: loadingPercent, message: loadingMessage });

        if (state === 'CONNECTED') {
            loadingPercent = 100;
            loadingMessage = 'Conexão estabelecida! Finalizando...';
            io.emit('loading_screen', { percent: 100, message: loadingMessage });
            setTimeout(() => {
                if (!isReady) {
                    isReady = true;
                    qrCodeUrl = null;
                    io.emit('ready');
                }
            }, 5000);
        }
    });

    client.on('auth_failure', (msg) => {
        console.error('>> Falha na autenticação:', msg);
        io.emit('loading_screen', { percent: 0, message: 'Falha ao autenticar. Recarregue a página.' });
    });

    client.on('disconnected', (reason) => {
        console.log('>> WhatsApp desconectado:', reason);
        isReady = false;
        isAuthenticated = false;
        loadingPercent = 0;
        loadingMessage = 'Desconectado';
        io.emit('disconnected', reason);
    });

    console.log('Preparando o WhatsApp... (a primeira vez pode demorar alguns segundos)');
    client.initialize().catch((err) => {
        console.error('\n[ERRO] Não foi possível iniciar o navegador do WhatsApp.');
        console.error('Dica: instale o Google Chrome ou o Microsoft Edge e tente de novo.');
        console.error('Detalhe técnico:', err.message);
    });
}

// ===== Rotas da API =====

// Situação atual da conexão (usada pela interface ao abrir/recarregar).
app.get('/status', (req, res) => {
    res.json({
        isReady,
        isAuthenticated,
        qrCodeUrl,
        loadingPercent,
        loadingMessage,
        modoTeste: MODO_TESTE,
        // Resumo da campanha em andamento (sem a lista de resultados, que pesa)
        campanhaAtual: campanhaAtual && {
            iniciadaEm: campanhaAtual.iniciadaEm,
            total: campanhaAtual.total,
            enviados: campanhaAtual.enviados,
            falhas: campanhaAtual.falhas,
            simulada: campanhaAtual.simulada,
        },
    });
});

// Histórico de campanhas (modo Registro da interface).
app.get('/historico', (req, res) => {
    res.json(carregarHistorico());
});

// Apagar todo o histórico.
app.delete('/historico', (req, res) => {
    salvarHistorico([]);
    res.json({ message: 'Histórico apagado' });
});

// Desconectar a conta do WhatsApp.
app.post('/logout', async (req, res) => {
    if (!client) {
        return res.json({ message: 'Nada para desconectar (modo de teste)' });
    }
    try {
        await client.logout();
        res.json({ message: 'Sessão encerrada' });
    } catch (err) {
        res.status(400).json({ message: 'Não foi possível encerrar a sessão' });
    }
});

// Disparo em massa.
app.post('/send-bulk', async (req, res) => {
    const { numbers, message, media, minDelay = 5000, maxDelay = 15000 } = req.body;

    if (!isReady) {
        return res.status(400).json({ error: 'O WhatsApp ainda não está conectado' });
    }
    if (campanhaAtual) {
        return res.status(400).json({ error: 'Já existe uma campanha em andamento. Aguarde ela terminar.' });
    }
    if (!Array.isArray(numbers) || numbers.length === 0) {
        return res.status(400).json({ error: 'Nenhum número foi informado' });
    }
    if (!message && !media) {
        return res.status(400).json({ error: 'Escreva uma mensagem ou anexe uma imagem' });
    }

    // Monta o objeto de mídia (se houver imagem anexada) - só no envio real.
    let mediaObj = null;
    if (media && !MODO_TESTE) {
        try {
            mediaObj = new MessageMedia(media.mimetype, media.data, media.filename);
        } catch (err) {
            console.error('Erro ao preparar a imagem:', err);
            return res.status(400).json({ error: 'Imagem inválida' });
        }
    }

    // Responde na hora e segue enviando em segundo plano (o progresso vai por socket).
    res.json({ message: 'Campanha iniciada', total: numbers.length });
    executarCampanha({
        numbers,
        message,
        mediaObj,
        minDelay,
        maxDelay,
        comImagem: !!media,
        simulada: MODO_TESTE,
    });
});

// ===== Execução da campanha (real ou simulada) =====
// Envia (ou finge enviar) para cada número, avisa a interface pelo socket a
// cada passo e, no fim, grava tudo no histórico (modo Registro).
async function executarCampanha({ numbers, message, mediaObj, minDelay, maxDelay, comImagem, simulada }) {
    const registro = {
        id: Date.now(),
        iniciadaEm: new Date().toISOString(),
        finalizadaEm: null,
        simulada,
        comImagem,
        mensagem: (message || '').slice(0, 300), // só uma prévia, não a íntegra
        total: numbers.length,
        enviados: 0,
        falhas: 0,
        resultados: [],
    };
    campanhaAtual = registro;

    // Na simulação, encurta a espera para o teste ser rápido (máx. 800ms).
    const min = simulada ? Math.min(minDelay, 800) : minDelay;
    const max = simulada ? Math.min(Math.max(maxDelay, min), 800) : maxDelay;

    console.log(`>> ${simulada ? '[TESTE] Simulando' : 'Iniciando'} campanha para ${numbers.length} número(s).`);

    for (let i = 0; i < numbers.length; i++) {
        const numeroBruto = numbers[i];
        let deuCerto = false;
        let erro = null;

        if (simulada) {
            deuCerto = Math.random() > 0.15; // ~85% de sucesso de mentira
            if (!deuCerto) erro = 'Falha simulada (modo de teste)';
        } else {
            try {
                const numeroFormatado = formatarNumero(numeroBruto);
                if (mediaObj) {
                    await client.sendMessage(numeroFormatado, mediaObj, { caption: message });
                } else {
                    await client.sendMessage(numeroFormatado, message);
                }
                deuCerto = true;
                console.log(`   Enviado para ${numeroFormatado} (${i + 1}/${numbers.length})`);
            } catch (err) {
                erro = err.toString();
                console.error(`   Falhou para ${numeroBruto}:`, err.message);
            }
        }

        if (deuCerto) registro.enviados++;
        else registro.falhas++;
        registro.resultados.push({
            numero: numeroBruto,
            ok: deuCerto,
            erro: erro || undefined,
            horario: new Date().toISOString(),
        });

        io.emit('progress', {
            index: i,
            total: numbers.length,
            number: numeroBruto,
            status: deuCerto ? 'sent' : 'failed',
            error: erro || undefined,
            enviados: registro.enviados,
            falhas: registro.falhas,
        });

        // Espera um tempo aleatório entre um envio e outro (reduz risco de bloqueio).
        if (i < numbers.length - 1) {
            const espera = Math.floor(Math.random() * (max - min + 1) + min);
            await delay(espera);
        }
    }

    registro.finalizadaEm = new Date().toISOString();
    campanhaAtual = null;

    // Grava no histórico (campanha mais recente primeiro).
    const historico = carregarHistorico();
    historico.unshift(registro);
    if (historico.length > LIMITE_HISTORICO) historico.length = LIMITE_HISTORICO;
    salvarHistorico(historico);

    io.emit('campaign_finished', {
        enviados: registro.enviados,
        falhas: registro.falhas,
        total: registro.total,
    });
    console.log(`>> Campanha finalizada: ${registro.enviados} enviados, ${registro.falhas} falhas.`);
}

// ===== Funções auxiliares =====

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Limpa o número (tira espaços, traços e parênteses) e adiciona o sufixo do WhatsApp.
function formatarNumero(numero) {
    let limpo = String(numero).replace(/\D/g, '');
    if (!limpo.endsWith('@c.us')) {
        limpo = `${limpo}@c.us`;
    }
    return limpo;
}

// Abre o navegador padrão na página do sistema (Windows, Mac ou Linux).
function abrirNavegador(url) {
    const comando =
        process.platform === 'win32' ? `start "" "${url}"`
        : process.platform === 'darwin' ? `open "${url}"`
        : `xdg-open "${url}"`;
    exec(comando, () => { /* se falhar, o usuário abre manualmente */ });
}

// ===== Sobe tudo =====
if (MODO_TESTE) {
    // No teste, já entramos "prontos" e avisamos cada navegador que conectar.
    isReady = true;
    isAuthenticated = true;
    loadingMessage = 'Modo de teste';
    io.on('connection', (socket) => socket.emit('ready'));
    console.log('>> MODO DE TESTE ativo: os envios serão apenas SIMULADOS.');
} else {
    iniciarWhatsApp();
}

servidor.listen(PORTA, () => {
    const url = `http://localhost:${PORTA}`;
    console.log('\n============================================');
    console.log(`   BJ Sender está no ar!${MODO_TESTE ? '  (MODO DE TESTE)' : ''}`);
    console.log(`   Abra no navegador: ${url}`);
    console.log('   Para encerrar: feche esta janela.');
    console.log('============================================\n');
    abrirNavegador(url);
});
