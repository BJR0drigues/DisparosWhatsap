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

  const handleStartCampaign = async (numbers, message, delaySettings) => {
    setIsSending(true);
    setLogs([]); // Clear previous logs
    try {
      await axios.post('http://localhost:3001/send-bulk', {
        numbers,
        message,
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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Stats / Welcome Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Gerenciador de Envios</h2>
            <p className="text-gray-400">Gerencie e dispare mensagens em massa.</p>
          </div>
          {isReady && (
            <div className="flex gap-4">
              <div className="bg-[#111b21] px-5 py-3 rounded-xl border border-gray-800">
                <span className="block text-xs text-gray-500 uppercase tracking-wider font-semibold">Status</span>
                <span className="text-green-400 font-medium flex items-center gap-2">
                  Ativo <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-220px)] min-h-[600px]">
          {/* Main Interaction Area */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {!isReady ? (
              <div className="h-full bg-[#111b21] rounded-2xl border border-gray-800 flex items-center justify-center p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-whatsapp-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <QRCodeDisplay
                  qrCode={qrCode}
                  isReady={isReady}
                  isAuthenticated={isAuthenticated}
                  loadingPercent={loadingPercent}
                  loadingMessage={loadingMessage}
                />
              </div>
            ) : (
              <div className="h-full bg-[#111b21] rounded-2xl border border-gray-800 p-1 relative overflow-hidden">
                <Sender isReady={isReady} onStartCampaign={handleStartCampaign} />
              </div>
            )}
          </div>

          {/* Logs Area */}
          <div className="lg:col-span-4 h-full bg-[#111b21] rounded-2xl border border-gray-800 overflow-hidden flex flex-col">
            <LogViewer logs={logs} isSending={isSending} />
          </div>
        </div>
      </div>
      <div className="text-center mt-12 pb-6 opacity-30 hover:opacity-100 transition-opacity duration-500">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Produzido por Brayan J Rodrigues</p>
      </div>
    </Layout >
  );
}

export default App;
