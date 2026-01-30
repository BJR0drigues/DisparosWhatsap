import React, { useState } from 'react';
import { Send, AlertTriangle, Loader2 } from 'lucide-react';
import axios from 'axios';

const Sender = ({ isReady, onStartCampaign }) => {
    const [numbersText, setNumbersText] = useState('');
    const [message, setMessage] = useState('');
    const [minDelay, setMinDelay] = useState(5000);
    const [maxDelay, setMaxDelay] = useState(15000);
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!numbersText || !message) return;

        // Parse numbers
        const numbers = numbersText
            .split(/[\n,]/) // Split by newline or comma
            .map(n => n.trim())
            .filter(n => n.length > 0); // basic filter

        if (numbers.length === 0) {
            alert("Por favor, insira pelo menos um número válido.");
            return;
        }

        if (numbers.length > 1000) {
            if (!confirm(`Aviso: Você está prestes a enviar para ${numbers.length} contatos. Isso é de alto risco. Continuar?`)) {
                return;
            }
        }

        setIsLoading(true);
        try {
            await axios.post('http://localhost:3001/send-bulk', {
                numbers,
                message,
                minDelay,
                maxDelay
            });
            onStartCampaign(numbers, message, { min: minDelay, max: maxDelay });
        } catch (err) {
            console.error(err);
            alert('Falha ao iniciar campanha');
        } finally {
            setIsLoading(false);
        }
    };

    const count = numbersText.split(/[\n,]/).filter(n => n.trim().length > 0).length;

    return (
        <div className="h-full flex flex-col bg-[#111b21]">
            {/* Header Section */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-[#1f2c34]/50 rounded-t-2xl">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Send className="w-5 h-5 text-whatsapp-green" />
                        Nova Campanha
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">Configure seu envio em massa.</p>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 flex-grow overflow-y-auto">
                <div className="flex flex-col h-full space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex justify-between items-center bg-gray-900/50 p-2 rounded-lg border border-gray-800">
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-whatsapp-green rounded-full"></span>
                            Destinatários
                        </span>
                        <span className="text-whatsapp-teal font-mono bg-whatsapp-teal/10 px-2 py-0.5 rounded text-xs">{count} contatos</span>
                    </label>
                    <div className="flex-grow relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-b from-whatsapp-green/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition duration-500 blur-sm pointer-events-none"></div>
                        <textarea
                            className="relative w-full h-full bg-[#0b141a] border border-gray-800 rounded-lg p-4 text-sm text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-whatsapp-green/50 focus:border-whatsapp-green/50 outline-none resize-none font-mono transition-all leading-relaxed shadow-inner"
                            placeholder={"5511999999999\n5511888888888\n..."}
                            value={numbersText}
                            onChange={(e) => setNumbersText(e.target.value)}
                            disabled={!isReady || isLoading}
                        />
                    </div>
                    <div className="text-xs text-gray-500 flex items-center justify-between px-1">
                        <span>Um número por linha</span>
                        <span>Formato internacional (55...)</span>
                    </div>
                </div>

                <div className="flex flex-col h-full space-y-6">
                    <div className="flex-grow flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-300 bg-gray-900/50 p-2 rounded-lg border border-gray-800 w-fit">Mensagem</label>
                        <textarea
                            className="flex-grow w-full bg-[#0b141a] border border-gray-800 rounded-lg p-4 text-sm text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-whatsapp-green/50 focus:border-whatsapp-green/50 outline-none resize-none shadow-inner transition-all"
                            placeholder="Digite sua mensagem aqui... (Suporta Emojis 🚀)"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={!isReady || isLoading}
                        />
                    </div>

                    <div className="bg-[#0b141a] p-5 rounded-xl border border-gray-800 shadow-lg">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Segurança & Atraso</label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-gray-500">Mínimo (ms)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={minDelay}
                                        onChange={e => setMinDelay(Number(e.target.value))}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-whatsapp-green/50 outline-none transition-colors"
                                    />
                                    <div className="absolute right-0 top-0 h-full w-1 bg-green-500/20 rounded-r-lg"></div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-500">Máximo (ms)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={maxDelay}
                                        onChange={e => setMaxDelay(Number(e.target.value))}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-whatsapp-green/50 outline-none transition-colors"
                                    />
                                    <div className="absolute right-0 top-0 h-full w-1 bg-green-500/20 rounded-r-lg"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!isReady || isLoading || !message || count === 0}
                        className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg shadow-green-900/20 transition-all duration-300 transform
              ${!isReady || isLoading
                                ? 'bg-gray-700 cursor-not-allowed opacity-50 grayscale'
                                : 'bg-gradient-to-r from-whatsapp-green to-green-600 hover:to-green-500 hover:scale-[1.02] active:scale-[0.98] ring-1 ring-white/10'}
            `}
                    >
                        <div className="flex items-center justify-center gap-3">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            <span>{isLoading ? 'INICIANDO...' : 'ENVIAR CAMPANHA'}</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sender;
