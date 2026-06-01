'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Zap, Blocks, Coins } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatUSD } from '@/lib/utils';

interface Stat {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
}

interface StatsRowProps {
  ethBalance: number;
  ethPrice: number;
  totalUSD: number;
  tokenCount: number;
}

export default function StatsRow({ ethBalance, ethPrice, totalUSD, tokenCount }: StatsRowProps) {
  const [gasGwei, setGasGwei] = useState<string>('...');
  const [blockNum, setBlockNum] = useState<string>('...');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const r = await fetch('https://mainnet.base.org', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_gasPrice', params: [], id: 1 }),
        });
        const gasData = await r.json();
        setGasGwei((parseInt(gasData.result, 16) / 1e9).toFixed(4));

        const rb = await fetch('https://mainnet.base.org', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 2 }),
        });
        const blockData = await rb.json();
        setBlockNum(parseInt(blockData.result, 16).toLocaleString());
      } catch { /* silent */ }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const stats: Stat[] = [
    {
      label: 'Portfolio Value',
      value: formatUSD(totalUSD),
      sub: `${ethBalance.toFixed(4)} ETH`,
      icon: TrendingUp,
      color: 'from-blue-500/20 to-blue-600/10',
    },
    {
      label: 'ETH Price',
      value: formatUSD(ethPrice),
      sub: 'Ethereum',
      icon: Coins,
      color: 'from-indigo-500/20 to-indigo-600/10',
    },
    {
      label: 'Gas Price',
      value: `${gasGwei} Gwei`,
      sub: 'Base Mainnet',
      icon: Zap,
      color: 'from-cyan-500/20 to-cyan-600/10',
    },
    {
      label: 'Latest Block',
      value: `#${blockNum}`,
      sub: `${tokenCount} tokens held`,
      icon: Blocks,
      color: 'from-violet-500/20 to-violet-600/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:border-flux-blue-border transition-all duration-300"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-60`} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-flux-muted uppercase tracking-wider font-medium">{stat.label}</span>
                <div className="w-7 h-7 rounded-lg bg-flux-blue-dim flex items-center justify-center">
                  <Icon size={14} className="text-flux-blue-light" />
                </div>
              </div>
              <p className="text-xl font-bold text-flux-text mb-0.5">{stat.value}</p>
              {stat.sub && <p className="text-[11px] text-flux-muted">{stat.sub}</p>}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
