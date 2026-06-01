'use client';

import { motion } from 'framer-motion';
import { LayoutDashboard, Wallet, ArrowLeftRight, MessageSquare, Zap, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'portfolio', label: 'Portfolio', icon: Wallet },
  { id: 'transactions', label: 'Activity', icon: ArrowLeftRight },
  { id: 'chat', label: 'AI Agent', icon: MessageSquare },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col border-r border-flux-blue-border bg-flux-card z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-flux-blue-border">
        <div className="relative">
          <div className="w-8 h-8 rounded-lg bg-flux-blue flex items-center justify-center">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <div className="absolute inset-0 rounded-lg bg-flux-blue blur-md opacity-40" />
        </div>
        <div>
          <span className="text-lg font-bold gradient-text">Flux</span>
          <p className="text-[10px] text-flux-muted tracking-widest uppercase">Base AI Hub</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-flux-blue text-white shadow-lg'
                  : 'text-flux-muted hover:text-flux-text hover:bg-flux-blue-dim'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-xl bg-flux-blue"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <Icon
                size={18}
                className={cn('relative z-10 transition-transform duration-200', !isActive && 'group-hover:scale-110')}
              />
              <span className="relative z-10">{item.label}</span>
              {item.id === 'chat' && (
                <span className="relative z-10 ml-auto text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full">AI</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-flux-blue-border space-y-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-flux-blue-dim">
          <div className="w-2 h-2 rounded-full bg-flux-success status-dot" />
          <span className="text-[11px] text-flux-muted">Base Mainnet</span>
          <a
            href="https://basescan.org"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-flux-muted hover:text-flux-blue-light transition-colors"
          >
            <ExternalLink size={12} />
          </a>
        </div>
        <p className="text-[10px] text-flux-muted text-center opacity-50">
          Powered by Claude + Base MCP
        </p>
      </div>
    </aside>
  );
}
