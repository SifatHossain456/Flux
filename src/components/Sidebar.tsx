'use client';

import { motion } from 'framer-motion';
import { LayoutDashboard, Wallet, ArrowLeftRight, MessageSquare, Zap, ExternalLink, Github } from 'lucide-react';
import { useAccount } from 'wagmi';
import { cn } from '@/lib/utils';
import { shortenAddress } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard',     label: 'Dashboard',  icon: LayoutDashboard, desc: 'Overview'     },
  { id: 'portfolio',     label: 'Portfolio',  icon: Wallet,           desc: 'Assets'       },
  { id: 'transactions',  label: 'Activity',   icon: ArrowLeftRight,   desc: 'Transactions' },
  { id: 'chat',          label: 'AI Agent',   icon: MessageSquare,    desc: 'Ask Claude'   },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { address, isConnected } = useAccount();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-30"
      style={{ background: 'rgba(6,11,22,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Ambient top glow */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-flux-blue/10 to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="relative flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-flux-blue flex items-center justify-center glow-blue-sm relative z-10">
            <Zap size={17} className="text-white" fill="white" />
          </div>
          <div className="absolute inset-0 rounded-xl bg-flux-blue blur-xl opacity-50" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[18px] font-bold gradient-text tracking-tight">Flux</span>
            <span className="text-[9px] font-medium bg-flux-blue/20 text-flux-blue-light border border-flux-blue/30 px-1.5 py-0.5 rounded-full tracking-wider uppercase">Beta</span>
          </div>
          <p className="text-[10px] text-flux-muted tracking-widest uppercase mt-0.5">Base AI Hub</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-4 space-y-0.5">
        <p className="text-[9px] text-flux-muted uppercase tracking-[0.15em] px-3 pb-2 font-medium">Navigation</p>
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden',
                isActive
                  ? 'text-white'
                  : 'text-flux-muted hover:text-flux-text'
              )}
            >
              {/* Active background */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, rgba(0,82,255,0.8), rgba(59,130,246,0.7))' }}
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
              {/* Hover background */}
              {!isActive && (
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-white/4" />
              )}

              <Icon
                size={16}
                className={cn('relative z-10 flex-shrink-0 transition-transform duration-150', !isActive && 'group-hover:scale-110')}
              />
              <span className="relative z-10 flex-1 text-left">{item.label}</span>
              {item.id === 'chat' && (
                <span className={cn(
                  'relative z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wider',
                  isActive ? 'bg-white/20 text-white' : 'bg-flux-blue/20 text-flux-blue-light border border-flux-blue/30'
                )}>AI</span>
              )}
              {isActive && (
                <div className="relative z-10 w-1.5 h-1.5 rounded-full bg-white/60" />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Wallet info */}
      {isConnected && address && (
        <div className="px-2.5 pb-3">
          <div className="px-3 py-2.5 rounded-xl bg-white/4 border border-white/6">
            <p className="text-[9px] text-flux-muted uppercase tracking-wider mb-1.5 font-medium">Connected Wallet</p>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-flux-blue to-flux-cyan flex-shrink-0" />
              <span className="text-xs font-mono text-flux-text">{shortenAddress(address)}</span>
              <a
                href={`https://basescan.org/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-flux-muted hover:text-flux-blue-light transition-colors"
              >
                <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-2.5 pb-4 space-y-2 border-t border-white/5 pt-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-flux-success/10 border border-flux-success/20">
          <div className="w-1.5 h-1.5 rounded-full bg-flux-success status-dot" />
          <span className="text-[11px] text-flux-success font-medium">Base Mainnet</span>
          <span className="ml-auto text-[9px] text-flux-success/60">8453</span>
        </div>
        <div className="flex items-center justify-between px-3">
          <p className="text-[10px] text-flux-muted/50">Claude · Base MCP</p>
          <a
            href="https://github.com/SifatHossain456/Flux"
            target="_blank"
            rel="noopener noreferrer"
            className="text-flux-muted/50 hover:text-flux-muted transition-colors"
          >
            <Github size={11} />
          </a>
        </div>
      </div>
    </aside>
  );
}
