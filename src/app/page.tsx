'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import PortfolioView from '@/components/PortfolioView';
import TxList from '@/components/TxList';
import ChatPanel from '@/components/ChatPanel';
import WalletButton from '@/components/WalletButton';
import { X } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chatOpen, setChatOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onOpenChat={() => { setActiveTab('chat'); }} />;
      case 'portfolio':
        return (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold gradient-text">Portfolio</h1>
            <PortfolioView />
          </div>
        );
      case 'transactions':
        return (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold gradient-text">Activity</h1>
            <TxList />
          </div>
        );
      case 'chat':
        return (
          <div className="h-full flex flex-col">
            <h1 className="text-2xl font-bold gradient-text mb-4 flex-shrink-0">AI Agent</h1>
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
    <div className="flex h-screen overflow-hidden dot-grid">
      {/* Ambient glow */}
      <div className="fixed top-0 left-64 right-0 h-px bg-gradient-to-r from-flux-blue/60 via-flux-blue/20 to-transparent pointer-events-none" />
      <div className="fixed top-20 left-1/3 w-96 h-96 bg-flux-blue/6 rounded-full blur-3xl pointer-events-none" />

      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main area */}
      <div className="flex-1 ml-64 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-flux-blue-border bg-flux-bg/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-flux-success status-dot" />
              <span className="text-[11px] text-flux-muted">Live</span>
            </div>
            <span className="text-flux-blue-border">|</span>
            <span className="text-[11px] text-flux-muted capitalize">{activeTab}</span>
          </div>
          <WalletButton />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={activeTab === 'chat' ? 'h-full flex flex-col' : ''}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating chat panel (from Dashboard "Ask AI" button) */}
      <AnimatePresence>
        {chatOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setChatOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-6 top-6 bottom-6 w-[420px] z-50 flex flex-col"
            >
              <button
                onClick={() => setChatOpen(false)}
                className="absolute -left-10 top-3 p-2 rounded-lg bg-flux-card border border-flux-blue-border text-flux-muted hover:text-flux-text transition-colors"
              >
                <X size={14} />
              </button>
              <ChatPanel />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
