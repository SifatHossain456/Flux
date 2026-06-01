'use client';

import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { MessageSquare, ExternalLink, Sparkles, ArrowUpRight, RefreshCw } from 'lucide-react';
import StatsRow from './StatsRow';
import PortfolioView from './PortfolioView';
import TxList from './TxList';
import ConnectHero from './ConnectHero';
import { shortenAddress, formatUSD } from '@/lib/utils';

interface DashboardProps { onOpenChat: () => void; }

const QUICK_ASKS = [
  'What\'s my total portfolio value?',
  'Show my last 5 transactions',
  'What\'s the current gas price?',
  'Search USDC token info',
];

export default function Dashboard({ onOpenChat }: DashboardProps) {
  const { address, isConnected } = useAccount();
  const [ethBal, setEthBal]     = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);
  const [loading, setLoading]   = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [balR, tokR, priceR] = await Promise.all([
        fetch(`https://api.basescan.org/api?module=account&action=balance&address=${address}&tag=latest`).then(r => r.json()),
        fetch(`https://api.basescan.org/api?module=account&action=tokenlist&address=${address}`).then(r => r.json()),
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd').then(r => r.json()),
      ]);
      setEthBal(Number(BigInt(balR.result ?? '0')) / 1e18);
      setEthPrice(priceR?.ethereum?.usd ?? 0);
      setTokenCount(Array.isArray(tokR.result) ? tokR.result.length : 0);
      setLastUpdated(new Date());
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [address]);

  if (!isConnected) return <ConnectHero />;

  const totalUSD = ethBal * ethPrice;

  return (
    <div className="space-y-7">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[26px] font-bold gradient-text tracking-tight">Dashboard</h1>
            <div className="w-2 h-2 rounded-full bg-flux-success status-dot mt-0.5" />
          </div>
          <p className="text-sm text-flux-muted">
            <span className="font-mono text-xs bg-white/5 px-2 py-0.5 rounded-md border border-white/8 mr-2">
              {shortenAddress(address!)}
            </span>
            Base Mainnet
            {lastUpdated && (
              <span className="ml-2 text-[11px] text-flux-muted/50">
                · updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="p-2 rounded-xl border border-white/8 text-flux-muted hover:text-flux-text hover:border-white/16 transition-all disabled:opacity-40"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <a
            href={`https://basescan.org/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/8 text-flux-muted hover:text-flux-text hover:border-white/16 text-xs transition-all"
          >
            <ExternalLink size={12} />
            Basescan
            <ArrowUpRight size={10} />
          </a>
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #0052FF, #4D8EFF)',
              boxShadow: '0 0 16px rgba(0,82,255,0.35), 0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <Sparkles size={14} />
            Ask AI
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <StatsRow ethBalance={ethBal} ethPrice={ethPrice} totalUSD={totalUSD} tokenCount={tokenCount} />

      {/* Main grid: Portfolio + AI Card */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* Portfolio (3/5) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4, ease: [0.23,1,0.32,1] }}
          className="xl:col-span-3"
        >
          <PortfolioView compact />
        </motion.div>

        {/* AI Card (2/5) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4, ease: [0.23,1,0.32,1] }}
          className="xl:col-span-2"
        >
          <div className="premium-card h-full relative overflow-hidden p-6 flex flex-col min-h-[300px]">
            {/* Background gradient */}
            <div className="absolute inset-0 rounded-2xl"
              style={{ background: 'radial-gradient(ellipse 100% 80% at 50% -10%, rgba(0,82,255,0.12), transparent 60%)' }} />

            {/* Animated orb */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-flux-blue/15 blur-2xl animate-pulse-slow" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-flux-blue/20 border border-flux-blue/30 flex items-center justify-center">
                  <MessageSquare size={13} className="text-flux-blue-light" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-flux-text">Flux AI Agent</p>
                  <p className="text-[10px] text-flux-muted">Claude · Base MCP</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full bg-flux-success/12 border border-flux-success/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-flux-success status-dot" />
                  <span className="text-[9px] text-flux-success font-medium">Online</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-flux-text mb-2 heading">Ask anything about your wallet</h3>
              <p className="text-[12px] text-flux-muted leading-relaxed mb-4">
                Natural language queries for portfolio, transactions, tokens, and DeFi insights.
              </p>

              {/* Quick asks */}
              <div className="flex-1 space-y-2">
                {QUICK_ASKS.map((q) => (
                  <button
                    key={q}
                    onClick={onOpenChat}
                    className="w-full text-left px-3 py-2 rounded-xl border border-white/6 bg-white/3 text-[11px] text-flux-muted hover:text-flux-text hover:border-flux-blue/30 hover:bg-flux-blue/6 transition-all duration-200 group"
                  >
                    <span className="text-flux-blue-light/50 group-hover:text-flux-blue-light mr-1.5 transition-colors">&ldquo;</span>
                    {q}
                    <span className="text-flux-blue-light/50 group-hover:text-flux-blue-light ml-1.5 transition-colors">&rdquo;</span>
                  </button>
                ))}
              </div>

              <button
                onClick={onOpenChat}
                className="mt-5 w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,82,255,0.9), rgba(59,130,246,0.8))',
                  boxShadow: '0 4px 20px rgba(0,82,255,0.3)',
                }}
              >
                <Sparkles size={14} />
                Open AI Chat
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent transactions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
      >
        <TxList compact />
      </motion.div>
    </div>
  );
}
