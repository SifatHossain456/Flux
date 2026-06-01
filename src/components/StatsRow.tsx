'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, Blocks, Coins, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { formatUSD } from '@/lib/utils';

interface StatsRowProps {
  ethBalance: number;
  ethPrice: number;
  totalUSD: number;
  tokenCount: number;
}

function useCountUp(target: number, duration = 1200) {
  const [current, setCurrent] = useState(0);
  const prevRef = useRef(0);
  useEffect(() => {
    if (target === 0) return;
    const start = prevRef.current;
    const startTime = performance.now();
    const raf = (time: number) => {
      const p = Math.min((time - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCurrent(start + (target - start) * ease);
      if (p < 1) requestAnimationFrame(raf);
      else { setCurrent(target); prevRef.current = target; }
    };
    requestAnimationFrame(raf);
  }, [target, duration]);
  return current;
}

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  accent: string;
  accentBg: string;
  delay: number;
  badge?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}

function StatCard({ label, value, sub, icon: Icon, accent, accentBg, delay, badge, trend, trendValue }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      className="premium-card p-5 group cursor-default"
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-6 right-6 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

      {/* Background glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse 60% 60% at 50% 0%, ${accentBg}, transparent)` }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-semibold text-flux-muted uppercase tracking-[0.12em]">{label}</p>
            {badge && (
              <span className="text-[9px] font-medium mt-0.5 inline-block px-1.5 py-0.5 rounded-full border"
                style={{ color: accent, borderColor: `${accent}30`, background: `${accent}10` }}>
                {badge}
              </span>
            )}
          </div>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: accentBg, border: `1px solid ${accent}25` }}>
            <Icon size={15} style={{ color: accent }} />
          </div>
        </div>

        <p className="text-[22px] font-bold text-flux-text tracking-tight leading-none mb-1.5 animate-count-up">
          {value}
        </p>

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-flux-muted">{sub}</p>
          {trend && trendValue && (
            <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${trend === 'up' ? 'text-flux-success' : 'text-flux-danger'}`}>
              {trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {trendValue}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function StatsRow({ ethBalance, ethPrice, totalUSD, tokenCount }: StatsRowProps) {
  const [gasGwei, setGasGwei] = useState<number>(0);
  const [blockNum, setBlockNum] = useState<number>(0);
  const [blockTime, setBlockTime] = useState<string>('~2s');

  const animGas   = useCountUp(gasGwei,  800);
  const animBlock = useCountUp(blockNum, 900);
  const animEth   = useCountUp(ethPrice, 1000);
  const animTotal = useCountUp(totalUSD, 1100);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [gasR, blockR] = await Promise.all([
          fetch('https://mainnet.base.org', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_gasPrice', params: [], id: 1 }),
          }).then(r => r.json()),
          fetch('https://mainnet.base.org', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 2 }),
          }).then(r => r.json()),
        ]);
        setGasGwei(parseFloat((parseInt(gasR.result, 16) / 1e9).toFixed(5)));
        setBlockNum(parseInt(blockR.result, 16));
      } catch { /* silent */ }
    };
    fetchStats();
    const iv = setInterval(fetchStats, 12000);
    return () => clearInterval(iv);
  }, []);

  const stats: StatCardProps[] = [
    {
      label: 'Portfolio Value',
      value: formatUSD(animTotal),
      sub: `${ethBalance.toFixed(5)} ETH`,
      icon: TrendingUp,
      accent: '#3B82F6',
      accentBg: 'rgba(59,130,246,0.1)',
      delay: 0,
      badge: 'Base Chain',
    },
    {
      label: 'ETH Price',
      value: `$${animEth.toFixed(2)}`,
      sub: 'Ethereum / USD',
      icon: Coins,
      accent: '#6366F1',
      accentBg: 'rgba(99,102,241,0.1)',
      delay: 0.08,
      trend: 'up',
      trendValue: 'Live',
    },
    {
      label: 'Gas Price',
      value: `${animGas.toFixed(4)} Gwei`,
      sub: `~${blockTime} block time`,
      icon: Zap,
      accent: '#06B6D4',
      accentBg: 'rgba(6,182,212,0.1)',
      delay: 0.16,
      badge: blockNum ? 'Live' : '—',
    },
    {
      label: 'Latest Block',
      value: `#${animBlock > 0 ? Math.floor(animBlock).toLocaleString() : '...'}`,
      sub: `${tokenCount} token${tokenCount !== 1 ? 's' : ''} held`,
      icon: Blocks,
      accent: '#8B5CF6',
      accentBg: 'rgba(139,92,246,0.1)',
      delay: 0.24,
      badge: 'Base',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => <StatCard key={s.label} {...s} />)}
    </div>
  );
}
