import React, { useRef, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Activity } from 'lucide-react';

const LogViewer = ({ logs, isSending }) => {
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-sm">
            {/* Header */}
            <div className="p-5 border-b border-gray-700/50 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Activity className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-100 text-sm">Registro de Atividade</h3>
                        <p className="text-xs text-gray-500">Acompanhe o status dos envios</p>
                    </div>
                </div>
                {isSending && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-whatsapp-teal/10 rounded-full border border-whatsapp-teal/20">
                        <span className="w-2 h-2 bg-whatsapp-teal rounded-full animate-pulse" />
                        <span className="text-xs text-whatsapp-teal font-semibold">Enviando</span>
                    </div>
                )}
            </div>

            {/* Logs List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-2.5 font-mono text-xs">
                {logs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                        <div className="relative mb-4">
                            <div className="absolute inset-0 bg-gray-600/20 rounded-full blur-xl animate-pulse" />
                            <Clock className="w-12 h-12 relative z-10" />
                        </div>
                        <p className="font-sans text-sm">Aguardando envios...</p>
                        <p className="font-sans text-xs text-gray-600 mt-1">Os logs aparecerão aqui</p>
                    </div>
                ) : (
                    logs.map((log, i) => (
                        <div
                            key={i}
                            className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300 animate-in fade-in border ${log.status === 'sent'
                                    ? 'bg-green-900/20 border-green-700/30 hover:bg-green-900/30'
                                    : 'bg-red-900/20 border-red-700/30 hover:bg-red-900/30'
                                }`}
                        >
                            {log.status === 'sent' ? (
                                <div className="relative">
                                    <div className="absolute inset-0 bg-green-500/30 rounded-full blur-sm" />
                                    <CheckCircle className="w-5 h-5 text-green-400 relative z-10 shrink-0" />
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="absolute inset-0 bg-red-500/30 rounded-full blur-sm" />
                                    <XCircle className="w-5 h-5 text-red-400 relative z-10 shrink-0" />
                                </div>
                            )}
                            <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-gray-200 text-sm">{log.number}</span>
                                    <span className="text-xs text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded-full">
                                        #{log.index + 1}/{log.total}
                                    </span>
                                </div>
                                {log.error && (
                                    <p className="text-xs text-red-400 mt-1 break-words leading-relaxed">{log.error}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
                <div ref={endRef} />
            </div>
        </div>
    );
};

export default LogViewer;
