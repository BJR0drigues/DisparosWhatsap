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
// Assim usamos o navegador do próprio usuário em vez de baixar o Chromium.
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

// Só carregados quando NÃO estamos em modo de teste (require preguiçoso).
let client = null;
let MessageMedia = null;

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

// Situação atual da conexão (usada pela interface ao abrir).
app.get('/status', (req, res) => {
    res.json({ isReady, isAuthenticated, qrCodeUrl, loadingPercent, loadingMessage });
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
    if (!Array.isArray(numbers) || numbers.length === 0) {
        return res.status(400).json({ error: 'Nenhum número foi informado' });
    }
    if (!message && !media) {
        return res.status(400).json({ error: 'Escreva uma mensagem ou anexe uma imagem' });
    }

    // Responde na hora e segue enviando em segundo plano (o progresso vai por socket).
    res.json({ message: 'Campanha iniciada', total: numbers.length });

    // No modo de teste, apenas simulamos os envios (sem tocar no WhatsApp).
    if (MODO_TESTE) {
        return simularCampanha(numbers, minDelay, maxDelay);
    }

    // ===== Envio real =====
    let mediaObj = null;
    if (media) {
        try {
            mediaObj = new MessageMedia(media.mimetype, media.data, media.filename);
        } catch (err) {
            console.error('Erro ao preparar a imagem:', err);
            io.emit('progress', { index: 0, total: numbers.length, number: '-', status: 'failed', error: 'Imagem inválida' });
            return;
        }
    }

    console.log(`>> Iniciando campanha para ${numbers.length} número(s).`);
    for (let i = 0; i < numbers.length; i++) {
        const numeroBruto = numbers[i];
        const numeroFormatado = formatarNumero(numeroBruto);

        try {
            if (mediaObj) {
                await client.sendMessage(numeroFormatado, mediaObj, { caption: message });
            } else {
                await client.sendMessage(numeroFormatado, message);
            }
            console.log(`   Enviado para ${numeroFormatado} (${i + 1}/${numbers.length})`);
            io.emit('progress', { index: i, total: numbers.length, number: numeroBruto, status: 'sent' });
        } catch (err) {
            console.error(`   Falhou para ${numeroFormatado}:`, err.message);
            io.emit('progress', {
                index: i,
                total: numbers.length,
                number: numeroBruto,
                status: 'failed',
                error: err.toString(),
            });
        }

        // Espera um tempo aleatório entre um envio e outro (reduz risco de bloqueio).
        if (i < numbers.length - 1) {
            const espera = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay);
            await delay(espera);
        }
    }

    io.emit('campaign_finished');
    console.log('>> Campanha finalizada.');
});

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

// Simula uma campanha (modo de teste): finge enviar, sem tocar no WhatsApp.
// ~85% de sucesso e alguns erros de mentira, com um intervalo curto entre um
// e outro para o teste ser rápido.
async function simularCampanha(numbers, minDelay, maxDelay) {
    console.log(`>> [TESTE] Simulando campanha para ${numbers.length} número(s).`);
    // No teste, limitamos a espera para no máximo 1 segundo.
    const min = Math.min(minDelay, 1000);
    const max = Math.min(Math.max(maxDelay, min), 1000);

    for (let i = 0; i < numbers.length; i++) {
        const deuCerto = Math.random() > 0.15; // ~85% de sucesso
        io.emit('progress', {
            index: i,
            total: numbers.length,
            number: numbers[i],
            status: deuCerto ? 'sent' : 'failed',
            error: deuCerto ? undefined : 'Falha simulada (modo de teste)',
        });

        if (i < numbers.length - 1) {
            const espera = Math.floor(Math.random() * (max - min + 1) + min);
            await delay(espera);
        }
    }

    io.emit('campaign_finished');
    console.log('>> [TESTE] Campanha simulada finalizada.');
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
