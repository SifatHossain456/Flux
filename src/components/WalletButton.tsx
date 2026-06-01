'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, ChevronDown } from 'lucide-react';

export default function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready     = mounted;
        const connected = ready && account && chain;
        return (
          <div {...(!ready && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' } })}>
            {!connected ? (
              <button
                onClick={openConnectModal}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #0052FF, #3B82F6)',
                  boxShadow: '0 0 16px rgba(0,82,255,0.3), 0 2px 8px rgba(0,0,0,0.25)',
                }}
              >
                <Wallet size={14} />
                Connect Wallet
              </button>
            ) : chain.unsupported ? (
              <button
                onClick={openChainModal}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-flux-danger/90 hover:bg-flux-danger text-white text-sm font-semibold transition-all"
              >
                Wrong Network
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {/* Chain selector */}
                <button
                  onClick={openChainModal}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/8 bg-white/4 text-flux-muted hover:text-flux-text hover:border-white/15 text-xs transition-all"
                >
                  {chain.hasIcon && chain.iconUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt={chain.name} src={chain.iconUrl} className="w-3.5 h-3.5 rounded-full" />
                  )}
                  {chain.name}
                  <ChevronDown size={10} className="opacity-60" />
                </button>

                {/* Account */}
                <button
                  onClick={openAccountModal}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/8 bg-white/4 text-xs font-medium hover:border-white/15 hover:bg-white/6 transition-all"
                >
                  {account.displayBalance && (
                    <span className="text-flux-success font-semibold">{account.displayBalance}</span>
                  )}
                  <span className="text-flux-muted">{account.displayName}</span>
                  <ChevronDown size={10} className="text-flux-muted/60" />
                </button>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
