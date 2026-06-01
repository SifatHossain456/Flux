'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet } from 'lucide-react';

export default function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;
        return (
          <div
            {...(!mounted && {
              'aria-hidden': true,
              style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
            })}
          >
            {!connected ? (
              <button
                onClick={openConnectModal}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-flux-blue hover:bg-flux-blue-light text-white text-sm font-medium transition-all duration-200 shadow-lg shadow-flux-blue/30 hover:shadow-flux-blue/50"
              >
                <Wallet size={15} />
                Connect Wallet
              </button>
            ) : chain.unsupported ? (
              <button
                onClick={openChainModal}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-flux-danger hover:bg-flux-danger/80 text-white text-sm font-medium transition-all"
              >
                Wrong Network
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={openChainModal}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-flux-blue-dim border border-flux-blue-border text-flux-muted hover:text-flux-text text-xs transition-all"
                >
                  {chain.hasIcon && chain.iconUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt={chain.name} src={chain.iconUrl} className="w-3.5 h-3.5 rounded-full" />
                  )}
                  {chain.name}
                </button>
                <button
                  onClick={openAccountModal}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-flux-blue-dim border border-flux-blue-border text-flux-text text-xs font-medium hover:border-flux-blue transition-all"
                >
                  {account.displayBalance && (
                    <span className="text-flux-success">{account.displayBalance}</span>
                  )}
                  <span className="text-flux-muted">{account.displayName}</span>
                </button>
              </div>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
