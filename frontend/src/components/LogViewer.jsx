import React, { useRef, useEffect } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const LogViewer = ({ logs, isSending }) => {
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-700 bg-gray-800/50 backdrop-blur flex justify-between items-center">
                <h3 className="font-bold text-gray-200">Registro de Atividade</h3>
                {isSending && <span className="text-xs text-whatsapp-teal animate-pulse">● Enviando...</span>}
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-2 font-mono text-sm max-h-[400px]">
                {logs.length === 0 ? (
                    <div className="text-center text-gray-500 py-10 opacity-50">
                        <Clock className="w-8 h-8 mx-auto mb-2" />
                        <p>Aguardando...</p>
                    </div>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} className={`flex items-start gap-2 p-2 rounded ${log.status === 'sent' ? 'bg-green-900/20' : 'bg-red-900/20'
                            }`}>
                            {log.status === 'sent' ? (
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            ) : (
                                <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            )}
                            <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <span className="font-bold text-gray-300">{log.number}</span>
                                    <span className="text-xs text-gray-600">#{log.index + 1}/{log.total}</span>
                                </div>
                                {log.error && (
                                    <p className="text-xs text-red-400 mt-1 break-words">{log.error}</p>
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
