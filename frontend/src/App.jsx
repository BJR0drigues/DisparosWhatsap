import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import QRCodeDisplay from './components/QRCodeDisplay';
import Sender from './components/Sender';
import LogViewer from './components/LogViewer';
import Layout from './components/Layout';
import { MessageSquare } from 'lucide-react';

// Connect to backend
const socket = io('http://localhost:3001');

function App() {
  const [qrCode, setQrCode] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Connecting to client...');

  useEffect(() => {
    // Initial status check
    axios.get('http://localhost:3001/status').then(res => {
      setIsReady(res.data.isReady);
      setIsAuthenticated(res.data.isAuthenticated);
      setLoadingPercent(res.data.loadingPercent || 0);
      setLoadingMessage(res.data.loadingMessage || 'Connecting...');
      if (res.data.qrCodeUrl) setQrCode(res.data.qrCodeUrl);
    }).catch(err => console.error("Server not reachable", err));

    // Socket events
    socket.on('qr', (url) => {
      setQrCode(url);
      setIsReady(false);
      setIsAuthenticated(false);
    });

    socket.on('ready', () => {
      setIsReady(true);
      setQrCode('');
      setIsAuthenticated(true);
    });

    socket.on('authenticated', () => {
      setIsAuthenticated(true);
      setQrCode(''); // Clear QR code as it's no longer needed
    });

    socket.on('disconnected', () => {
      setIsReady(false);
      setQrCode('');
    });

    socket.on('progress', (data) => {
      setIsSending(true);
      setLogs(prev => [...prev, data]);
    });

    socket.on('campaign_finished', () => {
      setIsSending(false);
      setLogs(prev => [...prev, { status: 'info', number: 'SYSTEM', error: 'Campaign Finished' }]); // simple hack to show finish
    });

    socket.on('loading_screen', ({ percent, message }) => {
      setLoadingPercent(percent);
      setLoadingMessage(message);
    });

    return () => {
      socket.off('qr');
      socket.off('ready');
      socket.off('progress');
      socket.off('disconnected');
      socket.off('loading_screen');
    };
  }, []);

  const handleStartCampaign = async (numbers, message, delaySettings, media) => {
    setIsSending(true);
    setLogs([]); // Clear previous logs
    try {
      await axios.post('http://localhost:3001/send-bulk', {
        numbers,
        message,
        media,
        minDelay: delaySettings.min,
        maxDelay: delaySettings.max
      });
    } catch (err) {
      console.error("Error starting campaign", err);
      setLogs(prev => [...prev, { status: 'failed', number: 'SYSTEM', error: 'Failed to start campaign backend' }]);
      setIsSending(false);
    }
  };

  const getStatusText = () => {
    if (isReady) return 'Online & Ready';
    if (isAuthenticated) return 'Syncing...';
    return 'Connecting';
  };

  return (
    <Layout isReady={isReady} status={getStatusText()}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-3">
              Gerenciador de Envios
            </h2>
            <p className="text-gray-400 text-lg">Gerencie e dispare mensagens em massa de forma profissional.</p>
          </div>
          {isReady && (
            <div className="flex gap-4">
              <div className="relative overflow-hidden bg-gradient-to-br from-green-900/40 to-green-800/40 px-6 py-4 rounded-2xl border border-green-700/50 backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-400 animate-gradient bg-[length:200%_100%]" />
                <span className="block text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Status</span>
                <span className="text-green-400 font-bold text-lg flex items-center gap-2">
                  Sistema Ativo
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[700px]">
          {/* Main Interaction Area */}
          <div className="lg:col-span-8 flex flex-col">
            {!isReady ? (
              <div className="h-full bg-gradient-to-br from-[#1a252e]/60 to-[#111b21]/60 rounded-3xl border border-gray-700/50 flex items-center justify-center p-10 relative overflow-hidden backdrop-blur-sm shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-whatsapp-green/5 via-transparent to-whatsapp-teal/5 opacity-50" />
                <QRCodeDisplay
                  qrCode={qrCode}
                  isReady={isReady}
                  isAuthenticated={isAuthenticated}
                  loadingPercent={loadingPercent}
                  loadingMessage={loadingMessage}
                />
              </div>
            ) : (
              <div className="h-full rounded-3xl border border-gray-700/50 relative overflow-hidden shadow-2xl">
                <Sender isReady={isReady} onStartCampaign={handleStartCampaign} />
              </div>
            )}
          </div>

          {/* Logs Area */}
          <div className="lg:col-span-4 h-full rounded-3xl border border-gray-700/50 overflow-hidden flex flex-col shadow-2xl">
            <LogViewer logs={logs} isSending={isSending} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;
