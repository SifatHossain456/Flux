'use client';

import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useEffect, useState } from 'react';
import { MessageSquare, ExternalLink, Zap } from 'lucide-react';
import StatsRow from './StatsRow';
import PortfolioView from './PortfolioView';
import TxList from './TxList';
interface DashboardProps {
  onOpenChat: () => void;
}

export default function Dashboard({ onOpenChat }: DashboardProps) {
  const { address, isConnected } = useAccount();
  const [ethBal, setEthBal] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);

  useEffect(() => {
    if (!address) return;
    const load = async () => {
      const [balR, tokR, priceR] = await Promise.all([
        fetch(`https://api.basescan.org/api?module=account&action=balance&address=${address}&tag=latest`).then((r) => r.json()),
        fetch(`https://api.basescan.org/api?module=account&action=tokenlist&address=${address}`).then((r) => r.json()),
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd').then((r) => r.json()),
      ]);
      const price = priceR?.ethereum?.usd ?? 0;
      setEthBal(Number(BigInt(balR.result ?? '0')) / 1e18);
      setEthPrice(price);
      setTokenCount(Array.isArray(tokR.result) ? tokR.result.length : 0);
    };
    load();
  }, [address]);

  const totalUSD = ethBal * ethPrice;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold gradient-text">Dashboard</h1>
          <p className="text-sm text-flux-muted mt-1">
            {isConnected
              ? `Base Mainnet · ${address?.slice(0, 6)}...${address?.slice(-4)}`
              : 'Connect your wallet to get started'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://basescan.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-flux-blue-border text-flux-muted hover:text-flux-blue-light hover:border-flux-blue text-xs transition-all"
          >
            <ExternalLink size={12} />
            Basescan
          </a>
          <button
            onClick={onOpenChat}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-flux-blue hover:bg-flux-blue-light text-white text-sm font-medium transition-all shadow-lg shadow-flux-blue/20"
          >
            <MessageSquare size={14} />
            Ask AI
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <StatsRow
        ethBalance={ethBal}
        ethPrice={ethPrice}
        totalUSD={totalUSD}
        tokenCount={tokenCount}
      />

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Portfolio (wider) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-3"
        >
          <PortfolioView compact />
        </motion.div>

        {/* AI promo card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2"
        >
          <div className="glass-card rounded-2xl overflow-hidden h-full relative">
            <div className="absolute inset-0 bg-gradient-to-br from-flux-blue/10 via-transparent to-transparent" />
            <div className="relative z-10 p-6 flex flex-col justify-between h-full min-h-[280px]">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-flux-blue/20 border border-flux-blue/30 flex items-center justify-center">
                    <Zap size={16} className="text-flux-blue-light" />
                  </div>
                  <span className="text-xs text-flux-muted font-medium uppercase tracking-wider">AI Agent</span>
                </div>
                <h3 className="text-lg font-bold text-flux-text mb-2">Ask Anything</h3>
                <p className="text-sm text-flux-muted leading-relaxed">
                  Powered by <span className="text-flux-blue-light font-medium">Claude AI</span> + Base MCP.
                  Query your portfolio, analyze transactions, search tokens, and get DeFi insights — all in natural language.
                </p>
              </div>

              <div className="space-y-2 mt-4">
                {[
                  '"Show my USDC balance"',
                  '"What were my last 5 swaps?"',
                  '"What\'s the gas price now?"',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={onOpenChat}
                    className="w-full text-left px-3 py-2 rounded-lg bg-flux-blue-dim border border-flux-blue-border text-[11px] text-flux-muted hover:text-flux-blue-light hover:border-flux-blue transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <button
                onClick={onOpenChat}
                className="mt-4 w-full py-2.5 rounded-xl bg-flux-blue hover:bg-flux-blue-light text-white text-sm font-medium transition-all shadow-lg shadow-flux-blue/25"
              >
                Open AI Chat →
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent transactions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <TxList compact />
      </motion.div>
    </div>
  );
}
