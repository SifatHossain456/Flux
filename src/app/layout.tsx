import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Flux — Base AI Dashboard',
  description: 'AI-powered Base chain wallet dashboard with real-time portfolio, transactions, and intelligent insights.',
  keywords: ['Base', 'blockchain', 'DeFi', 'AI', 'wallet', 'crypto'],
  openGraph: {
    title: 'Flux — Base AI Dashboard',
    description: 'AI-powered Base chain wallet intelligence hub.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-flux-bg text-flux-text antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
