import React from 'react';
import { MessageSquare, LayoutDashboard, BarChart3, Settings, LogOut, Menu } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
            ? 'bg-whatsapp-green text-white shadow-lg shadow-green-900/20 font-medium'
            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
    >
        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`} />
        <span className="text-sm">{label}</span>
    </button>
);

const Layout = ({ children, isReady, status }) => {
    return (
        <div className="flex min-h-screen bg-[#0b141a] text-gray-100 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-[#111b21] border-r border-gray-800 flex flex-col hidden md:flex">
                <div className="p-6">
                    <div className="flex items-center gap-3 px-2 mb-8">
                        <div className="bg-gradient-to-tr from-whatsapp-green to-whatsapp-teal p-2.5 rounded-xl shadow-lg shadow-green-900/20">
                            <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-white leading-none">WA Blast</h1>
                            <span className="text-xs text-whatsapp-green font-medium tracking-wider">PRO SENDER</span>
                        </div>
                    </div>

                    <nav className="space-y-2 flex-1">
                        <SidebarItem icon={LayoutDashboard} label="Dashboard" isActive={true} />
                        <SidebarItem icon={BarChart3} label="Reports" />
                        <SidebarItem icon={Settings} label="Settings" />
                    </nav>

                    <div className="mt-auto pt-6 border-t border-gray-800">
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-800 ${isReady ? 'border-green-900/30' : 'border-yellow-900/30'}`}>
                            <div className={`w-2.5 h-2.5 rounded-full ${isReady ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 animate-pulse'}`}></div>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-gray-300">Status</span>
                                <span className={`text-xs ${isReady ? 'text-green-400' : 'text-yellow-400'}`}>
                                    {status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <nav className="space-y-2">
                        <a href="#" className="block p-3 rounded-xl bg-whatsapp-green/10 text-whatsapp-green border border-whatsapp-green/20 transition-all flex items-center gap-3">
                            <LayoutDashboard size={20} />
                            <span className="font-medium">Início</span>
                        </a>
                    </nav>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <header className="md:hidden h-16 bg-[#111b21] border-b border-gray-800 flex items-center justify-between px-4 z-20">
                    <div className="flex items-center gap-3">
                        <div className="bg-whatsapp-green p-1.5 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-white">WA Blast Pro</span>
                    </div>
                    <button className="text-gray-400 p-2"><Menu className="w-6 h-6" /></button>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 scrollbar-hide">
                    {children}
                </main>

                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-[300px] bg-whatsapp-green/5 blur-[120px] pointer-events-none z-0" />
            </div>
        </div>
    );
};

export default Layout;
