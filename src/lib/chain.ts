import { http } from 'wagmi';
import { base, baseSepolia, mainnet } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export const wagmiConfig = getDefaultConfig({
  appName: 'Flux — Base AI Dashboard',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'demo',
  chains: [base, baseSepolia, mainnet],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [mainnet.id]: http(),
  },
  ssr: true,
});

export const BASE_CHAIN_ID = base.id; // 8453
export const BASE_EXPLORER = 'https://basescan.org';
export const BASE_SEPOLIA_EXPLORER = 'https://sepolia.basescan.org';
