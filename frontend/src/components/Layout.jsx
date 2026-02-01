import React from 'react';
import { MessageSquare, LayoutDashboard, Zap, Shield, Menu } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, isActive, badge, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
            ? 'bg-gradient-to-r from-whatsapp-green to-whatsapp-teal text-white shadow-lg shadow-green-900/30 font-medium'
            : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
            }`}
    >
        {isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-whatsapp-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
        <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'text-white scale-110' : 'text-gray-500 group-hover:text-gray-300 group-hover:scale-105'}`} />
        <span className="text-sm relative z-10">{label}</span>
        {badge && (
            <span className="ml-auto text-xs bg-whatsapp-green/20 text-whatsapp-green px-2 py-0.5 rounded-full font-semibold">
                {badge}
            </span>
        )}
    </button>
);

const Layout = ({ children, isReady, status }) => {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#0a1117] via-[#0b141a] to-[#0d1820] text-gray-100 font-sans overflow-hidden">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-whatsapp-green/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-whatsapp-teal/5 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            {/* Sidebar */}
            <aside className="w-80 bg-[#111b21]/80 backdrop-blur-xl border-r border-gray-800/50 flex flex-col hidden md:flex relative z-10 shadow-2xl">
                <div className="p-6 flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 px-3 py-4 rounded-2xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-whatsapp-green to-whatsapp-teal rounded-xl blur-md opacity-60" />
                                <div className="relative bg-gradient-to-tr from-whatsapp-green to-whatsapp-teal p-3 rounded-xl shadow-lg">
                                    <MessageSquare className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                                    WA Blast
                                </h1>
                                <span className="text-xs text-whatsapp-green font-semibold tracking-widest uppercase">
                                    Pro Sender
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2 flex-1">
                        <SidebarItem icon={LayoutDashboard} label="Dashboard" isActive={true} badge="ATIVO" />
                        <SidebarItem icon={Zap} label="Campanhas" />
                        <SidebarItem icon={Shield} label="Segurança" />
                    </nav>

                    {/* Status Section */}
                    <div className="mt-auto space-y-4">
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700/50 p-4 backdrop-blur-sm">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-whatsapp-green via-whatsapp-teal to-whatsapp-green bg-[length:200%_100%] animate-gradient" />

                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className={`w-3 h-3 rounded-full ${isReady ? 'bg-green-500' : 'bg-yellow-500'}`}>
                                        <div className={`absolute inset-0 rounded-full ${isReady ? 'bg-green-500' : 'bg-yellow-500'} animate-ping opacity-75`} />
                                    </div>
                                </div>
                                <div className="flex flex-col flex-1">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status do Sistema</span>
                                    <span className={`text-sm font-bold ${isReady ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Branding */}
                        <div className="text-center py-3 px-4 rounded-xl bg-gray-900/30 border border-gray-800/50">
                            <p className="text-xs text-gray-500 font-mono tracking-wider">
                                Desenvolvido por
                            </p>
                            <p className="text-xs text-whatsapp-green font-semibold mt-0.5">
                                Brayan J Rodrigues
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
                <header className="md:hidden h-16 bg-[#111b21]/90 backdrop-blur-xl border-b border-gray-800/50 flex items-center justify-between px-4 z-20">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-tr from-whatsapp-green to-whatsapp-teal p-2 rounded-lg shadow-lg shadow-green-900/30">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-white">WA Blast Pro</span>
                    </div>
                    <button className="text-gray-400 p-2 hover:bg-gray-800 rounded-lg transition-colors">
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative scrollbar-thin">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
