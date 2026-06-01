'use client';

import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useCallback, useEffect, useState } from 'react';
import { Wallet, RefreshCw, ExternalLink } from 'lucide-react';
import { shortenAddress, formatUSD } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Token {
  symbol: string;
  name: string;
  contractAddress: string;
  balance: string;
  decimals: string;
  tokenPriceUSD?: number;
}

interface PortfolioViewProps {
  compact?: boolean;
}

function TokenRow({ token, index }: { token: Token & { balanceNum: number }; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-flux-blue-dim transition-colors duration-200 group"
    >
      <div className="w-9 h-9 rounded-full bg-flux-blue-dim flex items-center justify-center text-xs font-bold text-flux-blue-light flex-shrink-0">
        {token.symbol.slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-flux-text truncate">{token.symbol}</p>
        <p className="text-[11px] text-flux-muted truncate">{token.name}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-flux-text">{token.balanceNum.toFixed(4)}</p>
        <a
          href={`https://basescan.org/token/${token.contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-flux-muted hover:text-flux-blue-light flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {shortenAddress(token.contractAddress, 3)} <ExternalLink size={9} />
        </a>
      </div>
    </motion.div>
  );
}

export default function PortfolioView({ compact = false }: PortfolioViewProps) {
  const { address, isConnected } = useAccount();
  const [tokens, setTokens] = useState<(Token & { balanceNum: number })[]>([]);
  const [ethBal, setEthBal] = useState<number>(0);
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [ethR, tokenR, priceR] = await Promise.all([
        fetch(`https://api.basescan.org/api?module=account&action=balance&address=${address}&tag=latest`).then((r) => r.json()),
        fetch(`https://api.basescan.org/api?module=account&action=tokenlist&address=${address}`).then((r) => r.json()),
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd').then((r) => r.json()),
      ]);
      setEthBal(Number(BigInt(ethR.result ?? '0')) / 1e18);
      setEthPrice(priceR?.ethereum?.usd ?? 0);
      const rawTokens: Token[] = Array.isArray(tokenR.result) ? tokenR.result : [];
      const parsed = rawTokens
        .map((t) => ({ ...t, balanceNum: Number(BigInt(t.balance ?? '0')) / Math.pow(10, Number(t.decimals ?? 18)) }))
        .filter((t) => t.balanceNum > 0)
        .sort((a, b) => b.balanceNum - a.balanceNum)
        .slice(0, compact ? 6 : 20);
      setTokens(parsed);
    } catch { /* silent */ }
    setLoading(false);
  }, [address]);

  useEffect(() => { load(); }, [load]);

  if (!isConnected) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <Wallet size={32} className="mx-auto text-flux-muted mb-3 opacity-40" />
        <p className="text-flux-muted text-sm">Connect your wallet to view portfolio</p>
      </div>
    );
  }

  const ethUSD = ethBal * ethPrice;
  const totalUSD = ethUSD;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-flux-blue-border">
        <div>
          <h3 className="text-sm font-semibold text-flux-text">Token Holdings</h3>
          <p className="text-[11px] text-flux-muted mt-0.5">{shortenAddress(address!)} · Base Mainnet</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className={cn('p-2 rounded-lg hover:bg-flux-blue-dim text-flux-muted hover:text-flux-blue-light transition-all', loading && 'opacity-50')}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ETH row */}
      <div className="px-4 py-3 border-b border-flux-blue-border/50">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-flux-blue flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">Ξ</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-flux-text">ETH</p>
            <p className="text-[11px] text-flux-muted">Ethereum</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-flux-text">{ethBal.toFixed(6)}</p>
            <p className="text-[11px] text-flux-success">{formatUSD(ethUSD)}</p>
          </div>
        </div>
      </div>

      {/* Token list */}
      <div className={cn('divide-y divide-flux-blue-border/30', compact ? '' : 'max-h-96 overflow-y-auto')}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="w-9 h-9 rounded-full shimmer" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-20 rounded shimmer" />
                <div className="h-2.5 w-28 rounded shimmer" />
              </div>
              <div className="h-3 w-16 rounded shimmer" />
            </div>
          ))
        ) : tokens.length === 0 ? (
          <p className="text-center text-flux-muted text-sm py-8">No tokens found</p>
        ) : (
          tokens.map((t, i) => <TokenRow key={t.contractAddress} token={t} index={i} />)
        )}
      </div>

      {!compact && tokens.length > 0 && (
        <div className="px-5 py-3 border-t border-flux-blue-border text-right">
          <span className="text-xs text-flux-muted">{tokens.length} tokens · Total ≈ </span>
          <span className="text-xs font-semibold text-flux-success">{formatUSD(totalUSD)}</span>
        </div>
      )}
    </div>
  );
}
