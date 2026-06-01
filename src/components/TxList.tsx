'use client';

import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, ExternalLink, RefreshCw, Repeat2, Code2 } from 'lucide-react';
import { shortenAddress, timeAgo, formatEth } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Tx {
  hash: string; from: string; to: string; value: string;
  timeStamp: string; isError: string; functionName: string; input: string;
}

type Filter = 'all' | 'in' | 'out';

function getMethod(tx: Tx, address: string): { label: string; icon: React.ElementType; color: string } {
  const fn = tx.functionName?.split('(')[0]?.toLowerCase() ?? '';
  const isOut = tx.from.toLowerCase() === address.toLowerCase();
  if (fn.includes('swap'))          return { label: 'Swap',     icon: Repeat2,      color: '#8B5CF6' };
  if (tx.input && tx.input !== '0x' && !isOut) return { label: 'Contract', icon: Code2,       color: '#F59E0B' };
  if (fn.includes('transfer') || fn.includes('send') || (!fn && tx.value !== '0'))
    return isOut
      ? { label: 'Send',    icon: ArrowUpRight,  color: '#3B82F6' }
      : { label: 'Receive', icon: ArrowDownLeft, color: '#10B981' };
  return isOut
    ? { label: 'Send',    icon: ArrowUpRight,  color: '#3B82F6' }
    : { label: 'Receive', icon: ArrowDownLeft, color: '#10B981' };
}

export default function TxList({ compact = false }: { compact?: boolean }) {
  const { address, isConnected } = useAccount();
  const [txs, setTxs]       = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter]  = useState<Filter>('all');

  const load = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const r = await fetch(
        `https://api.basescan.org/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${compact ? 10 : 30}&sort=desc`
      );
      const data = await r.json();
      setTxs(Array.isArray(data.result) ? data.result : []);
    } catch { /* silent */ }
    setLoading(false);
  }, [address, compact]);

  useEffect(() => { load(); }, [load]);

  const filtered = txs.filter(tx => {
    if (filter === 'all') return true;
    const isOut = tx.from.toLowerCase() === address?.toLowerCase();
    return filter === 'out' ? isOut : !isOut;
  });

  if (!isConnected) {
    return (
      <div className="premium-card p-10 text-center">
        <p className="text-sm text-flux-muted">Connect wallet to see activity</p>
      </div>
    );
  }

  return (
    <div className="premium-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/6">
        <h3 className="text-sm font-semibold text-flux-text heading flex-1">
          {compact ? 'Recent Activity' : 'Transaction History'}
        </h3>

        {/* Filter tabs */}
        {!compact && (
          <div className="flex items-center gap-1 bg-white/4 rounded-xl p-1">
            {(['all','in','out'] as Filter[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize',
                  filter === f ? 'bg-white/10 text-flux-text' : 'text-flux-muted hover:text-flux-text'
                )}>
                {f}
              </button>
            ))}
          </div>
        )}

        <button onClick={load} disabled={loading}
          className={cn('p-2 rounded-lg hover:bg-white/6 text-flux-muted hover:text-flux-text transition-all', loading && 'opacity-40')}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className={cn(compact ? '' : 'max-h-[480px] overflow-y-auto')}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-white/4">
              <div className="w-8 h-8 rounded-full shimmer" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-24 rounded shimmer" />
                <div className="h-2.5 w-40 rounded shimmer" />
              </div>
              <div className="h-3 w-16 rounded shimmer" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-flux-muted py-10">No transactions found</p>
        ) : (
          filtered.map((tx, i) => {
            if (!address) return null;
            const method  = getMethod(tx, address);
            const isOut   = tx.from.toLowerCase() === address.toLowerCase();
            const isError = tx.isError === '1';
            const Icon    = method.icon;
            const ethVal  = formatEth(tx.value);

            return (
              <motion.div
                key={tx.hash}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.03, 0.25) }}
                className="flex items-center gap-4 px-5 py-3.5 border-b border-white/4 hover:bg-white/2 transition-colors group"
              >
                {/* Method icon */}
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isError ? 'rgba(239,68,68,0.12)' : `${method.color}14`,
                    border: `1px solid ${isError ? 'rgba(239,68,68,0.25)' : `${method.color}25`}`,
                  }}>
                  <Icon size={14} style={{ color: isError ? '#EF4444' : method.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-flux-text">{method.label}</span>
                    {isError && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-flux-danger/12 text-flux-danger border border-flux-danger/20">
                        Failed
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-flux-muted truncate">
                    {isOut ? `→ ${shortenAddress(tx.to)}` : `← ${shortenAddress(tx.from)}`}
                    {' · '}{timeAgo(tx.timeStamp)}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  {tx.value !== '0' && (
                    <p className={cn('text-sm font-semibold', isOut ? 'text-flux-muted' : 'text-flux-success')}>
                      {isOut ? '-' : '+'}{ethVal} ETH
                    </p>
                  )}
                  {tx.value === '0' && (
                    <p className="text-xs text-flux-muted/50">Contract</p>
                  )}
                  <a
                    href={`https://basescan.org/tx/${tx.hash}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-[10px] text-flux-muted hover:text-flux-blue-light opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {shortenAddress(tx.hash, 4)} <ExternalLink size={9} />
                  </a>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {compact && txs.length > 0 && (
        <div className="px-5 py-3 border-t border-white/5 text-center">
          <span className="text-[11px] text-flux-muted/60">{txs.length} recent transactions · Base Mainnet</span>
        </div>
      )}
    </div>
  );
}
