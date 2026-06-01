'use client';

import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useCallback, useEffect, useState } from 'react';
import { Wallet, RefreshCw, ExternalLink, Search, X } from 'lucide-react';
import { shortenAddress, formatUSD } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Token {
  symbol: string; name: string; contractAddress: string;
  balance: string; decimals: string; balanceNum: number;
}

// Rough USD prices for common tokens (fallback approximation)
const KNOWN_PRICES: Record<string, number> = {
  USDC: 1, USDT: 1, DAI: 1, BUSD: 1,
  WETH: 0, // will get from ETH price
  CBETH: 0,
};

function DonutChart({ tokens, ethBal, ethPrice }: { tokens: Token[]; ethBal: number; ethPrice: number }) {
  const ethUSD   = ethBal * ethPrice;
  const stables  = tokens.filter(t => ['USDC','USDT','DAI','BUSD'].includes(t.symbol.toUpperCase()));
  const stableUSD = stables.reduce((s, t) => s + t.balanceNum, 0);
  const otherUSD = 0; // simplified
  const total    = ethUSD + stableUSD + otherUSD || 1;

  const segments = [
    { label: 'ETH',     value: ethUSD,    color: '#3B82F6', pct: ethUSD / total },
    { label: 'Stables', value: stableUSD, color: '#10B981', pct: stableUSD / total },
    { label: 'Other',   value: otherUSD,  color: '#8B5CF6', pct: otherUSD / total },
  ].filter(s => s.value > 0);

  const R = 42; const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex items-center gap-5 p-5 border-b border-white/6">
      <div className="relative flex-shrink-0">
        <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
          {segments.map((seg, i) => {
            const dash = seg.pct * C;
            const el = (
              <circle key={i} cx="50" cy="50" r={R} fill="none"
                stroke={seg.color} strokeWidth="12"
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                style={{ transition: 'stroke-dasharray 0.8s ease', filter: `drop-shadow(0 0 6px ${seg.color}60)` }}
              />
            );
            offset += dash;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-bold text-flux-text">{formatUSD(ethUSD + stableUSD)}</span>
          <span className="text-[9px] text-flux-muted">Total</span>
        </div>
      </div>

      <div className="space-y-2 flex-1">
        {segments.map(seg => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: seg.color }} />
            <span className="text-[11px] text-flux-muted flex-1">{seg.label}</span>
            <span className="text-[11px] font-medium text-flux-text">{formatUSD(seg.value)}</span>
            <span className="text-[10px] text-flux-muted/60">{(seg.pct * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TokenRow({ token, idx }: { token: Token; idx: number }) {
  const isStable = ['USDC','USDT','DAI','BUSD'].includes(token.symbol.toUpperCase());
  const usdApprox = isStable ? token.balanceNum : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.04, ease: [0.23,1,0.32,1] }}
      className="flex items-center gap-3.5 px-5 py-3 hover:bg-white/3 transition-colors group"
    >
      {/* Icon */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
        style={{ background: isStable ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.12)', color: isStable ? '#10B981' : '#60A5FA', border: `1px solid ${isStable ? 'rgba(16,185,129,0.25)' : 'rgba(59,130,246,0.2)'}` }}>
        {token.symbol.slice(0, 2).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-flux-text">{token.symbol}</p>
        <p className="text-[11px] text-flux-muted truncate">{token.name}</p>
      </div>

      <div className="text-right">
        <p className="text-sm font-semibold text-flux-text">
          {token.balanceNum < 0.0001 ? '<0.0001' : token.balanceNum.toLocaleString('en-US', { maximumFractionDigits: 4 })}
        </p>
        {usdApprox !== null && (
          <p className="text-[11px] text-flux-success">{formatUSD(usdApprox)}</p>
        )}
        <a
          href={`https://basescan.org/token/${token.contractAddress}`}
          target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-flux-muted hover:text-flux-blue-light flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {shortenAddress(token.contractAddress, 3)} <ExternalLink size={9} />
        </a>
      </div>
    </motion.div>
  );
}

export default function PortfolioView({ compact = false }: { compact?: boolean }) {
  const { address, isConnected } = useAccount();
  const [tokens, setTokens]   = useState<Token[]>([]);
  const [ethBal, setEthBal]   = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery]     = useState('');

  const load = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [ethR, tokenR, priceR] = await Promise.all([
        fetch(`https://api.basescan.org/api?module=account&action=balance&address=${address}&tag=latest`).then(r => r.json()),
        fetch(`https://api.basescan.org/api?module=account&action=tokenlist&address=${address}`).then(r => r.json()),
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd').then(r => r.json()),
      ]);
      setEthBal(Number(BigInt(ethR.result ?? '0')) / 1e18);
      setEthPrice(priceR?.ethereum?.usd ?? 0);
      const raw: Token[] = Array.isArray(tokenR.result) ? tokenR.result : [];
      const parsed = raw
        .map(t => ({ ...t, balanceNum: Number(BigInt(t.balance ?? '0')) / Math.pow(10, Number(t.decimals ?? 18)) }))
        .filter(t => t.balanceNum > 0)
        .sort((a, b) => {
          const aS = ['USDC','USDT','DAI','BUSD'].includes(a.symbol.toUpperCase()) ? b.balanceNum - a.balanceNum : 0;
          return aS || b.balanceNum - a.balanceNum;
        })
        .slice(0, compact ? 8 : 30);
      setTokens(parsed);
    } catch { /* silent */ }
    setLoading(false);
  }, [address, compact]);

  useEffect(() => { load(); }, [load]);

  const filtered = query
    ? tokens.filter(t => t.symbol.toLowerCase().includes(query.toLowerCase()) || t.name.toLowerCase().includes(query.toLowerCase()))
    : tokens;

  if (!isConnected) {
    return (
      <div className="premium-card p-10 text-center">
        <Wallet size={28} className="mx-auto text-flux-muted/30 mb-3" />
        <p className="text-sm text-flux-muted">Connect wallet to view portfolio</p>
      </div>
    );
  }

  return (
    <div className="premium-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
        <div>
          <h3 className="text-sm font-semibold text-flux-text heading">Token Holdings</h3>
          <p className="text-[11px] text-flux-muted mt-0.5">{shortenAddress(address!)} · {tokens.length + 1} assets</p>
        </div>
        <button onClick={load} disabled={loading}
          className={cn('p-2 rounded-lg hover:bg-white/6 text-flux-muted hover:text-flux-text transition-all', loading && 'opacity-40')}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Donut chart */}
      <DonutChart tokens={tokens} ethBal={ethBal} ethPrice={ethPrice} />

      {/* ETH row */}
      <div className="flex items-center gap-3.5 px-5 py-3.5 border-b border-white/6 bg-white/2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-flux-blue to-blue-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">Ξ</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-flux-text">Ethereum</p>
          <p className="text-[11px] text-flux-muted">ETH · Native</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-flux-text">{ethBal.toFixed(6)}</p>
          <p className="text-[11px] text-flux-success">{formatUSD(ethBal * ethPrice)}</p>
        </div>
      </div>

      {/* Search (only when not compact) */}
      {!compact && tokens.length > 5 && (
        <div className="px-5 py-3 border-b border-white/5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/4 border border-white/7">
            <Search size={12} className="text-flux-muted flex-shrink-0" />
            <input
              type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search tokens…"
              className="flex-1 bg-transparent text-sm text-flux-text placeholder:text-flux-muted/50 outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-flux-muted hover:text-flux-text transition-colors">
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Token list */}
      <div className={cn('divide-y divide-white/4', compact ? '' : 'max-h-80 overflow-y-auto')}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3.5 px-5 py-3">
              <div className="w-8 h-8 rounded-full shimmer" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-20 rounded shimmer" />
                <div className="h-2 w-28 rounded shimmer" />
              </div>
              <div className="h-3 w-16 rounded shimmer" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-flux-muted">{query ? 'No tokens match' : 'No tokens found'}</p>
          </div>
        ) : (
          filtered.map((t, i) => <TokenRow key={t.contractAddress} token={t} idx={i} />)
        )}
      </div>

      {/* Footer */}
      {tokens.length > 0 && (
        <div className="px-5 py-2.5 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] text-flux-muted/50">{tokens.length} tokens · Base Mainnet</span>
          <span className="text-[10px] font-semibold text-flux-success">
            {formatUSD(ethBal * ethPrice + tokens.filter(t => ['USDC','USDT','DAI','BUSD'].includes(t.symbol.toUpperCase())).reduce((s,t) => s + t.balanceNum, 0))}
          </span>
        </div>
      )}
    </div>
  );
}
