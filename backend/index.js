const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for dev simplicity
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

const port = 3001;

// WhatsApp Client Setup
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ],
        headless: false, // Keep false for debugging
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' // Force use of installed Chrome
    }
});

let isReady = false;
let isAuthenticated = false;
let qrCodeUrl = null;
let loadingPercent = 0;
let loadingMessage = 'Initializing...';

client.on('qr', async (qr) => {
    console.log('QR RECEIVED', qr);
    isAuthenticated = false; // Reset if new QR needed
    loadingMessage = 'Scan QR Code';
    loadingPercent = 0;
    try {
        qrCodeUrl = await qrcode.toDataURL(qr);
        io.emit('qr', qrCodeUrl);
        io.emit('loading_screen', { percent: 0, message: 'Scan QR Code' });
    } catch (err) {
        console.error('Error generating QR code', err);
    }
});

client.on('ready', () => {
    console.log('Client is ready!');
    isReady = true;
    isAuthenticated = true;
    qrCodeUrl = null;
    io.emit('ready');
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
    isAuthenticated = true;
    qrCodeUrl = null;
    io.emit('authenticated');

    // Force feedback
    loadingMessage = 'Authenticated. Waiting for WhatsApp interface...';
    loadingPercent = 10;
    io.emit('loading_screen', { percent: loadingPercent, message: loadingMessage });

    // Force Ready after delay because change_state isn't firing
    setTimeout(() => {
        if (!isReady) {
            console.log('Forcing Ready State from Authenticated');
            isReady = true;
            isAuthenticated = true;
            qrCodeUrl = null;
            io.emit('ready');
        }
    }, 8000); // 8 seconds to be safe
});

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
    loadingPercent = percent;
    loadingMessage = message;
    io.emit('loading_screen', { percent, message });
});

client.on('change_state', state => {
    console.log('CHANGE STATE', state);
    loadingMessage = `State: ${state}`;
    io.emit('loading_screen', { percent: loadingPercent, message: loadingMessage });

    if (state === 'CONNECTED') {
        loadingPercent = 100;
        loadingMessage = 'Connection established! Finalizing...';
        io.emit('loading_screen', { percent: 100, message: loadingMessage });

        // Manual ready trigger because sometimes wwebjs misses it
        setTimeout(() => {
            if (!isReady) {
                console.log('Forcing Ready State');
                isReady = true;
                isAuthenticated = true;
                qrCodeUrl = null;
                io.emit('ready');
            }
        }, 5000);
    }
});

client.on('disconnected', (reason) => {
    console.log('Client was disconnected', reason);
    isReady = false;
    isAuthenticated = false;
    loadingPercent = 0;
    loadingMessage = 'Disconnected';
    io.emit('disconnected', reason);
});

// ...

app.get('/status', (req, res) => {
    res.json({ isReady, isAuthenticated, qrCodeUrl, loadingPercent, loadingMessage });
});

app.post('/logout', async (req, res) => {
    if (client) {
        await client.logout();
        res.json({ message: 'Logged out' });
    } else {
        res.status(400).json({ message: 'Client not initialized' });
    }
})

app.post('/send-bulk', async (req, res) => {
    const { numbers, message, minDelay = 5000, maxDelay = 15000 } = req.body;

    if (!isReady) {
        return res.status(400).json({ error: 'Client is not ready' });
    }

    if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
        return res.status(400).json({ error: 'No numbers provided' });
    }

    if (!message) {
        return res.status(400).json({ error: 'No message provided' });
    }

    // Process in background
    res.json({ message: 'Campaign started', total: numbers.length });

    console.log(`Starting campaign for ${numbers.length} numbers`);

    for (let i = 0; i < numbers.length; i++) {
        const rawNumber = numbers[i];
        const formattedNum = formatNumber(rawNumber);

        try {
            // Note: sendMessage can fail if the number doesn't exist on WA.
            // verifying the number first is safer but slower:
            // const isRegistered = await client.isRegisteredUser(formattedNum);
            // if(isRegistered) ...

            await client.sendMessage(formattedNum, message);
            console.log(`Sent to ${formattedNum} (${i + 1}/${numbers.length})`);
            io.emit('progress', {
                index: i,
                total: numbers.length,
                number: rawNumber,
                status: 'sent'
            });
        } catch (error) {
            console.error(`Failed to send to ${formattedNum}:`, error);
            io.emit('progress', {
                index: i,
                total: numbers.length,
                number: rawNumber,
                status: 'failed',
                error: error.toString()
            });
        }

        // Random delay
        if (i < numbers.length - 1) {
            const waitTime = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay);
            await delay(waitTime);
        }
    }
    io.emit('campaign_finished');
});

// Helper to delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to format number
const formatNumber = (number) => {
    let cleaned = number.replace(/\D/g, '');
    if (!cleaned.endsWith('@c.us')) {
        cleaned = `${cleaned}@c.us`;
    }
    return cleaned;
};

console.log('Initializing WA Client...');
client.initialize();

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
