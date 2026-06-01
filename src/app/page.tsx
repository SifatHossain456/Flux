'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import PortfolioView from '@/components/PortfolioView';
import TxList from '@/components/TxList';
import ChatPanel from '@/components/ChatPanel';
import WalletButton from '@/components/WalletButton';
import { Zap } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  dashboard:    'Dashboard',
  portfolio:    'Portfolio',
  transactions: 'Activity',
  chat:         'AI Agent',
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Keyboard shortcut: Cmd/Ctrl+K → go to chat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setActiveTab('chat');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onOpenChat={() => setActiveTab('chat')} />;
      case 'portfolio':
        return (
          <div className="space-y-5">
            <div>
              <h1 className="text-[26px] font-bold gradient-text tracking-tight">Portfolio</h1>
              <p className="text-sm text-flux-muted mt-1">All token holdings on Base Mainnet</p>
            </div>
            <PortfolioView />
          </div>
        );
      case 'transactions':
        return (
          <div className="space-y-5">
            <div>
              <h1 className="text-[26px] font-bold gradient-text tracking-tight">Activity</h1>
              <p className="text-sm text-flux-muted mt-1">Transaction history on Base Mainnet</p>
            </div>
            <TxList />
          </div>
        );
      case 'chat':
        return (
          <div className="h-full flex flex-col gap-4">
            <div className="flex-shrink-0">
              <h1 className="text-[26px] font-bold gradient-text tracking-tight">AI Agent</h1>
              <p className="text-sm text-flux-muted mt-1">Powered by Claude · Base MCP · Natural language wallet queries</p>
            </div>
            <div className="flex-1 min-h-0">
              <ChatPanel />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden app-bg dot-grid">

      {/* Ambient glows */}
      <div className="fixed top-0 left-0 w-80 h-80 rounded-full bg-flux-blue/8 blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 right-0 w-96 h-96 rounded-full bg-purple-600/5 blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />
      <div className="fixed top-1/2 left-64 right-0 h-px bg-gradient-to-r from-flux-blue/20 via-transparent to-transparent pointer-events-none" style={{ top: 0 }} />

      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main */}
      <div className="flex-1 ml-64 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center justify-between px-7 py-3.5 border-b border-white/5 flex-shrink-0"
          style={{ background: 'rgba(5,10,20,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-flux-success status-dot" />
              <span className="text-[11px] text-flux-muted font-medium">Live</span>
            </div>
            <span className="text-white/15 text-sm">/</span>
            <span className="text-[12px] text-flux-text font-medium">{PAGE_TITLES[activeTab]}</span>
          </div>

          {/* Right: keyboard hint + wallet */}
          <div className="flex items-center gap-3">
            {activeTab !== 'chat' && (
              <button
                onClick={() => setActiveTab('chat')}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/8 text-flux-muted hover:text-flux-text hover:border-white/15 text-[11px] transition-all group"
              >
                <Zap size={11} className="text-flux-blue-light" />
                AI Chat
                <kbd className="ml-1 text-[9px] bg-white/6 border border-white/10 px-1.5 py-0.5 rounded-md font-mono opacity-60 group-hover:opacity-100 transition-opacity">
                  ⌘K
                </kbd>
              </button>
            )}
            <WalletButton />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-7 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className={activeTab === 'chat' ? 'h-full flex flex-col' : ''}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
