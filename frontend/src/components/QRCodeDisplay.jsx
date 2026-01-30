import React from 'react';
import { Loader2 } from 'lucide-react';

const QRCodeDisplay = ({ qrCode, isReady, isAuthenticated, loadingPercent, loadingMessage }) => {
    return (
        <div className="flex flex-col items-center justify-center max-w-sm w-full relative z-10">
            <div className="bg-[#1f2c34] p-8 rounded-2xl shadow-2xl border border-gray-800 w-full text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-whatsapp-green to-whatsapp-teal"></div>

                <h2 className="text-2xl font-bold text-white mb-2">Connect WhatsApp</h2>
                <p className="text-gray-400 text-sm mb-8">Scan the QR code to start sending.</p>

                {isReady ? (
                    <div className="flex flex-col items-center animate-in fade-in duration-500 py-4">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4 ring-1 ring-green-500/50">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/40">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-lg font-bold text-white">System Ready</p>
                        <p className="text-gray-500 text-sm mt-1">Waiting for campaign...</p>
                    </div>
                ) : isAuthenticated ? (
                    <div className="flex flex-col items-center animate-in fade-in duration-500 py-8 w-full">
                        <div className="relative flex items-center justify-center mb-6">
                            <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"></div>
                            <Loader2 className="w-16 h-16 text-whatsapp-green animate-spin relative z-10" />
                        </div>
                        <p className="text-lg font-bold text-white">Authenticated</p>
                        <p className="text-gray-400 text-sm mt-1">{loadingMessage || 'Syncing conversations...'}</p>

                        {/* Progress Bar */}
                        <div className="w-full max-w-[200px] mt-4">
                            <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-whatsapp-green transition-all duration-300 rounded-full ${loadingPercent < 5 ? 'animate-pulse' : ''}`}
                                    style={{ width: `${Math.max(5, loadingPercent)}%` }} // Minimum 5% visibility
                                ></div>
                            </div>
                            <p className="text-right text-xs text-green-400 mt-1 font-mono">{loadingPercent}%</p>
                        </div>

                        <div className="mt-4 px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
                            <span className="text-xs text-gray-500">Do not close this window</span>
                        </div>
                    </div>
                ) : qrCode ? (
                    <div className="bg-white p-3 rounded-xl shadow-lg mx-auto inline-block mb-6 relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-whatsapp-green to-blue-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <img src={qrCode} alt="Scan with WhatsApp" className="w-64 h-64 relative z-10 mix-blend-multiply" />
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-gray-400 py-12">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-gray-600" />
                        <p className="font-medium text-sm">Initializing Secure Client...</p>
                    </div>
                )}

                {!isReady && qrCode && (
                    <div className="text-left bg-gray-900/50 p-4 rounded-lg border border-gray-800/50 mt-2">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Instructions</p>
                        <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                            <li>Open <span className="text-gray-300 font-medium">WhatsApp</span> on your phone</li>
                            <li>Go to <span className="text-gray-300 font-medium">Linked Devices</span> in Settings</li>
                            <li>Tap <span className="text-gray-300 font-medium">Link a Device</span> and scan</li>
                        </ol>
                    </div>
                )}
            </div>

            <p className="mt-8 text-xs text-gray-600 font-medium">End-to-End Encrypted Session</p>
        </div>
    );
};

export default QRCodeDisplay;
