'use client';

import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, Shield, Zap, BarChart3, MessageSquare, ArrowRight } from 'lucide-react';

const features = [
  { icon: BarChart3, label: 'Portfolio',   desc: 'Real-time token balances & USD values',       color: '#3B82F6' },
  { icon: Zap,       label: 'AI Agent',    desc: 'Ask Claude about your wallet in natural language', color: '#8B5CF6' },
  { icon: Shield,    label: 'Activity',    desc: 'Full transaction history with filters',        color: '#06B6D4' },
  { icon: MessageSquare, label: 'Insights', desc: 'DeFi analytics and token intelligence',      color: '#10B981' },
];

export default function ConnectHero() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full space-y-10">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-center space-y-5"
        >
          {/* Logo mark */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-flux-blue flex items-center justify-center animate-float"
                style={{ boxShadow: '0 0 40px rgba(0,82,255,0.5), 0 0 80px rgba(0,82,255,0.2)' }}>
                <Zap size={30} className="text-white" fill="white" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-flux-blue blur-2xl opacity-40" />
            </div>
          </div>

          <div>
            <h1 className="text-5xl font-bold gradient-text mb-2 tracking-tight">Flux</h1>
            <p className="text-lg text-flux-muted font-light">
              AI-powered Base chain wallet intelligence
            </p>
          </div>

          <p className="text-sm text-flux-muted/80 leading-relaxed max-w-md mx-auto">
            Connect your wallet to unlock real-time portfolio insights, transaction analysis,
            and natural language queries powered by <span className="text-flux-blue-light font-medium">Claude AI</span> + <span className="text-flux-blue-light font-medium">Base MCP</span>.
          </p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex justify-center pt-2"
          >
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="group flex items-center gap-3 px-7 py-3.5 rounded-2xl text-white font-semibold text-sm transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #0052FF, #3B82F6)',
                    boxShadow: '0 0 24px rgba(0,82,255,0.4), 0 4px 16px rgba(0,0,0,0.3)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 40px rgba(0,82,255,0.6), 0 4px 24px rgba(0,0,0,0.4)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(0,82,255,0.4), 0 4px 16px rgba(0,0,0,0.3)'; }}
                >
                  <Wallet size={16} />
                  Connect Wallet
                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
              )}
            </ConnectButton.Custom>
          </motion.div>

          <p className="text-[11px] text-flux-muted/40">
            MetaMask · Coinbase Wallet · WalletConnect · and more
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-2 gap-3"
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
                className="premium-card p-4 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
                    <Icon size={14} style={{ color: f.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-flux-text mb-0.5">{f.label}</p>
                    <p className="text-[11px] text-flux-muted leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <p className="text-[11px] text-flux-muted/40">
            Read-only access · No private keys stored · Open source on{' '}
            <a href="https://github.com/SifatHossain456/Flux" target="_blank" rel="noopener noreferrer"
              className="text-flux-muted/60 hover:text-flux-muted transition-colors underline underline-offset-2">
              GitHub
            </a>
          </p>
        </motion.div>

      </div>
    </div>
  );
}
