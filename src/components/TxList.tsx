'use client';

import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, ExternalLink, RefreshCw } from 'lucide-react';
import { shortenAddress, timeAgo, formatEth } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Tx {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  isError: string;
  functionName: string;
}

interface TxListProps {
  compact?: boolean;
}

export default function TxList({ compact = false }: TxListProps) {
  const { address, isConnected } = useAccount();
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const r = await fetch(
        `https://api.basescan.org/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${compact ? 8 : 25}&sort=desc`
      );
      const data = await r.json();
      setTxs(Array.isArray(data.result) ? data.result : []);
    } catch { /* silent */ }
    setLoading(false);
  }, [address]);

  useEffect(() => { load(); }, [load]);

  if (!isConnected) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-flux-muted text-sm">Connect wallet to see activity</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-flux-blue-border">
        <h3 className="text-sm font-semibold text-flux-text">Recent Activity</h3>
        <button
          onClick={load}
          disabled={loading}
          className={cn('p-2 rounded-lg hover:bg-flux-blue-dim text-flux-muted hover:text-flux-blue-light transition-all', loading && 'opacity-50')}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className={cn(compact ? '' : 'max-h-[520px] overflow-y-auto')}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-flux-blue-border/30">
              <div className="w-8 h-8 rounded-full shimmer" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 rounded shimmer" />
                <div className="h-2.5 w-48 rounded shimmer" />
              </div>
              <div className="h-3 w-20 rounded shimmer" />
            </div>
          ))
        ) : txs.length === 0 ? (
          <p className="text-center text-flux-muted text-sm py-10">No transactions found</p>
        ) : (
          txs.map((tx, i) => {
            const isOut = tx.from.toLowerCase() === address?.toLowerCase();
            const isError = tx.isError === '1';
            const method = tx.functionName?.split('(')[0] || (isOut ? 'Send' : 'Receive');
            const ethValue = formatEth(tx.value);

            return (
              <motion.div
                key={tx.hash}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="flex items-center gap-4 px-5 py-3.5 border-b border-flux-blue-border/30 hover:bg-flux-blue-dim transition-colors group"
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    isError
                      ? 'bg-flux-danger/15 text-flux-danger'
                      : isOut
                      ? 'bg-flux-blue/15 text-flux-blue-light'
                      : 'bg-flux-success/15 text-flux-success'
                  )}
                >
                  {isOut ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-flux-text capitalize truncate">{method}</span>
                    {isError && (
                      <span className="text-[10px] bg-flux-danger/15 text-flux-danger px-1.5 py-0.5 rounded-full">Failed</span>
                    )}
                  </div>
                  <p className="text-[11px] text-flux-muted truncate">
                    {isOut ? `→ ${shortenAddress(tx.to)}` : `← ${shortenAddress(tx.from)}`}
                    {' · '}{timeAgo(tx.timeStamp)}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className={cn('text-sm font-medium', isOut ? 'text-flux-muted' : 'text-flux-success')}>
                    {isOut ? '-' : '+'}{ethValue} ETH
                  </p>
                  <a
                    href={`https://basescan.org/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-flux-muted hover:text-flux-blue-light flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {shortenAddress(tx.hash, 4)} <ExternalLink size={9} />
                  </a>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
