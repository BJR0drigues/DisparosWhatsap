import React, { useState, useRef } from 'react';
import { Send, Clock, Paperclip, Smile, Trash2, Image as ImageIcon, X } from 'lucide-react';

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

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Lista de Números</label>
                    <div className="relative group">
                        <textarea
                            className="w-full h-40 bg-[#202c33] border border-gray-700 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-whatsapp-green focus:ring-1 focus:ring-whatsapp-green transition-all"
                            placeholder="Cole os números aqui (um por linha)..."
                            value={numbers}
                            onChange={(e) => setNumbers(e.target.value)}
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-500 font-mono">
                            {numbers.split('\n').filter(n => n.trim()).length} contatos
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Mensagem</label>
                    <textarea
                        className="w-full h-40 bg-[#202c33] border border-gray-700 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-whatsapp-green focus:ring-1 focus:ring-whatsapp-green transition-all"
                        placeholder="Digite sua mensagem..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>

                {/* Media Attachment Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Anexo de Mídia</label>
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
                            className="px-4 py-2 bg-[#202c33] border border-gray-700 rounded-lg hover:border-whatsapp-green transition-colors text-gray-300 flex items-center gap-2"
                        >
                            <ImageIcon className="w-5 h-5" />
                            Escolher Imagem
                        </button>

                        {media && (
                            <div className="relative group">
                                <img src={media.preview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-gray-600" />
                                <button
                                    onClick={clearMedia}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                                <span className="block text-xs text-gray-500 mt-1 max-w-[100px] truncate">{media.filename}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-[#202c33] p-4 rounded-xl border border-gray-700">
                    <label className="block text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Configuração de Delay (segundos)</label>
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <span className="text-xs text-gray-500 mb-1 block">Mínimo</span>
                            <input
                                type="number"
                                value={minDelay}
                                onChange={(e) => setMinDelay(Number(e.target.value))}
                                className="w-full bg-[#111b21] border border-gray-700 rounded-lg p-2 text-white text-center focus:border-whatsapp-green outline-none"
                            />
                        </div>
                        <span className="text-gray-600">-</span>
                        <div className="flex-1">
                            <span className="text-xs text-gray-500 mb-1 block">Máximo</span>
                            <input
                                type="number"
                                value={maxDelay}
                                onChange={(e) => setMaxDelay(Number(e.target.value))}
                                className="w-full bg-[#111b21] border border-gray-700 rounded-lg p-2 text-white text-center focus:border-whatsapp-green outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-gray-800 bg-[#202c33]">
                <button
                    onClick={handleStart}
                    disabled={!isReady}
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${isReady
                        ? 'bg-whatsapp-green text-white hover:bg-green-600 shadow-[0_4px_20px_rgba(37,211,102,0.2)] hover:shadow-[0_4px_25px_rgba(37,211,102,0.4)]'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    <Send className="w-5 h-5" />
                    {isReady ? 'Iniciar Disparos' : 'Aguardando Conexão...'}
                </button>
            </div>
        </div>
    );
};

export default Sender;
