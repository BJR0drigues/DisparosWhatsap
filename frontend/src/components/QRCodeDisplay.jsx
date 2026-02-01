import React from 'react';
import { Loader2, Shield, Smartphone } from 'lucide-react';

const QRCodeDisplay = ({ qrCode, isReady, isAuthenticated, loadingPercent, loadingMessage }) => {
    return (
        <div className="flex flex-col items-center justify-center max-w-md w-full relative z-10">
            <div className="bg-gradient-to-br from-[#1a252e] to-[#111b21] p-10 rounded-3xl shadow-2xl border border-gray-700/50 w-full text-center relative overflow-hidden backdrop-blur-sm">
                {/* Animated top border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-whatsapp-green via-whatsapp-teal to-whatsapp-green bg-[length:200%_100%] animate-gradient" />

                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-whatsapp-green/5 to-transparent opacity-50" />

                <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 mb-3">
                        Conectar WhatsApp
                    </h2>
                    <p className="text-gray-400 text-sm mb-10">
                        Escaneie o QR code para iniciar os envios
                    </p>

                    {isReady ? (
                        <div className="flex flex-col items-center animate-in fade-in duration-500 py-6">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse" />
                                <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40">
                                    <svg className="w-12 h-12 text-white animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-xl font-bold text-white mb-2">Sistema Pronto</p>
                            <p className="text-gray-400 text-sm">Aguardando campanha...</p>
                        </div>
                    ) : isAuthenticated ? (
                        <div className="flex flex-col items-center animate-in fade-in duration-500 py-10 w-full">
                            <div className="relative flex items-center justify-center mb-8">
                                <div className="absolute inset-0 bg-whatsapp-green/20 blur-2xl rounded-full animate-pulse" />
                                <Loader2 className="w-20 h-20 text-whatsapp-green animate-spin relative z-10" strokeWidth={2.5} />
                            </div>
                            <p className="text-xl font-bold text-white mb-2">Autenticado</p>
                            <p className="text-gray-400 text-sm mb-6">{loadingMessage || 'Sincronizando conversas...'}</p>

                            {/* Enhanced Progress Bar */}
                            <div className="w-full max-w-[240px] space-y-2">
                                <div className="h-2 w-full bg-gray-800/80 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className={`h-full bg-gradient-to-r from-whatsapp-green to-whatsapp-teal transition-all duration-500 rounded-full relative overflow-hidden ${loadingPercent < 5 ? 'animate-pulse' : ''}`}
                                        style={{ width: `${Math.max(5, loadingPercent)}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                                    </div>
                                </div>
                                <p className="text-center text-sm text-green-400 font-mono font-semibold">{loadingPercent}%</p>
                            </div>

                            <div className="mt-6 px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700/50">
                                <span className="text-xs text-gray-400 flex items-center gap-2">
                                    <Shield className="w-3 h-3" />
                                    Não feche esta janela
                                </span>
                            </div>
                        </div>
                    ) : qrCode ? (
                        <div className="animate-in fade-in duration-500">
                            <div className="bg-white p-4 rounded-2xl shadow-2xl mx-auto inline-block mb-8 relative group">
                                <div className="absolute -inset-2 bg-gradient-to-r from-whatsapp-green via-whatsapp-teal to-blue-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition-all duration-700 animate-gradient bg-[length:200%_200%]" />
                                <img src={qrCode} alt="Scan with WhatsApp" className="w-72 h-72 relative z-10" />
                            </div>

                            <div className="text-left bg-gradient-to-br from-gray-900/60 to-gray-800/60 p-5 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <Smartphone className="w-4 h-4 text-whatsapp-green" />
                                    <p className="text-xs text-whatsapp-green font-bold uppercase tracking-wider">Instruções</p>
                                </div>
                                <ol className="text-sm text-gray-300 space-y-2.5 list-decimal list-inside">
                                    <li>Abra o <span className="text-white font-semibold">WhatsApp</span> no seu celular</li>
                                    <li>Vá em <span className="text-white font-semibold">Aparelhos Conectados</span> nas configurações</li>
                                    <li>Toque em <span className="text-white font-semibold">Conectar Aparelho</span> e escaneie</li>
                                </ol>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-gray-400 py-16">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-gray-600/20 rounded-full blur-xl animate-pulse" />
                                <Loader2 className="w-12 h-12 animate-spin text-gray-500 relative z-10" />
                            </div>
                            <p className="font-medium text-sm text-gray-500">Inicializando cliente seguro...</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-gray-900/30 rounded-full border border-gray-800/50">
                <Shield className="w-3.5 h-3.5 text-gray-500" />
                <p className="text-xs text-gray-500 font-medium">Sessão Criptografada de Ponta a Ponta</p>
            </div>
        </div>
    );
};

export default QRCodeDisplay;
