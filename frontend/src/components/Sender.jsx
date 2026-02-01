import React, { useState, useRef } from 'react';
import { Send, Clock, Image as ImageIcon, X, Users, MessageCircle, Timer } from 'lucide-react';

const Sender = ({ isReady, onStartCampaign }) => {
    const [numbers, setNumbers] = useState('');
    const [message, setMessage] = useState('');
    const [minDelay, setMinDelay] = useState(5);
    const [maxDelay, setMaxDelay] = useState(15);
    const [media, setMedia] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMedia({
                    data: reader.result.split(',')[1],
                    mimetype: file.type,
                    filename: file.name,
                    preview: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const clearMedia = () => {
        setMedia(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleStart = () => {
        if (!numbers || (!message && !media)) return;
        const numberList = numbers.split('\n').filter(n => n.trim().length > 0);
        onStartCampaign(numberList, message, { min: minDelay, max: maxDelay }, media);
    };

    const contactCount = numbers.split('\n').filter(n => n.trim()).length;

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-[#1a252e]/50 to-[#111b21]/50 rounded-xl">
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {/* Numbers Input Card */}
                <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-whatsapp-green/10 rounded-lg">
                            <Users className="w-5 h-5 text-whatsapp-green" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-200">Lista de Números</label>
                            <p className="text-xs text-gray-500">Um número por linha</p>
                        </div>
                        <div className="px-3 py-1.5 bg-whatsapp-green/10 rounded-lg border border-whatsapp-green/20">
                            <span className="text-xs font-bold text-whatsapp-green">{contactCount} contatos</span>
                        </div>
                    </div>
                    <div className="relative group">
                        <textarea
                            className="w-full h-36 bg-[#0d1418] border border-gray-700/50 rounded-xl p-4 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-whatsapp-green focus:ring-2 focus:ring-whatsapp-green/20 transition-all resize-none font-mono text-sm"
                            placeholder="+5511999999999&#10;+5521888888888&#10;+5531777777777"
                            value={numbers}
                            onChange={(e) => setNumbers(e.target.value)}
                        />
                    </div>
                </div>

                {/* Message Input Card */}
                <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <MessageCircle className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-200">Mensagem</label>
                            <p className="text-xs text-gray-500">Conteúdo que será enviado</p>
                        </div>
                    </div>
                    <textarea
                        className="w-full h-36 bg-[#0d1418] border border-gray-700/50 rounded-xl p-4 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
                        placeholder="Digite sua mensagem aqui...&#10;&#10;Use variáveis e personalize seu texto."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>

                {/* Media Attachment Card */}
                <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <ImageIcon className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-200">Anexo de Mídia</label>
                            <p className="text-xs text-gray-500">Adicione uma imagem (opcional)</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-5 py-2.5 bg-[#0d1418] border border-gray-700/50 rounded-xl hover:border-purple-400/50 hover:bg-purple-500/5 transition-all duration-300 text-gray-300 flex items-center gap-2 font-medium"
                        >
                            <ImageIcon className="w-4 h-4" />
                            Escolher Imagem
                        </button>

                        {media && (
                            <div className="relative group/img">
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-sm opacity-30 group-hover/img:opacity-60 transition-opacity duration-300" />
                                <div className="relative">
                                    <img src={media.preview} alt="Preview" className="h-24 w-24 object-cover rounded-xl border-2 border-gray-600" />
                                    <button
                                        onClick={clearMedia}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <span className="block text-xs text-gray-400 mt-2 max-w-[100px] truncate text-center">{media.filename}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Delay Configuration Card */}
                <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <Timer className="w-5 h-5 text-orange-400" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-200">Intervalo de Envio</label>
                            <p className="text-xs text-gray-500">Delay entre mensagens (segundos)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex-1">
                            <span className="text-xs text-gray-400 mb-2 block font-medium">Mínimo</span>
                            <input
                                type="number"
                                value={minDelay}
                                onChange={(e) => setMinDelay(Number(e.target.value))}
                                className="w-full bg-[#0d1418] border border-gray-700/50 rounded-xl p-3 text-white text-center font-bold text-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all"
                            />
                        </div>
                        <div className="text-gray-600 text-2xl font-bold mt-6">→</div>
                        <div className="flex-1">
                            <span className="text-xs text-gray-400 mb-2 block font-medium">Máximo</span>
                            <input
                                type="number"
                                value={maxDelay}
                                onChange={(e) => setMaxDelay(Number(e.target.value))}
                                className="w-full bg-[#0d1418] border border-gray-700/50 rounded-xl p-3 text-white text-center font-bold text-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="p-6 border-t border-gray-700/50 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm">
                <button
                    onClick={handleStart}
                    disabled={!isReady || (!numbers || (!message && !media))}
                    className={`w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden group ${isReady && (numbers && (message || media))
                            ? 'bg-gradient-to-r from-whatsapp-green to-whatsapp-teal text-white hover:shadow-[0_0_40px_rgba(37,211,102,0.4)] hover:scale-[1.02] active:scale-[0.98]'
                            : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {isReady && (numbers && (message || media)) && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    )}
                    <Send className="w-6 h-6 relative z-10" />
                    <span className="relative z-10">
                        {!isReady ? 'Aguardando Conexão...' : (!numbers || (!message && !media)) ? 'Preencha os Campos' : 'Iniciar Disparos'}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default Sender;
