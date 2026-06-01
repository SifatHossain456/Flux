import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatUSD(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

export function formatToken(value: string, decimals: number, precision = 4): string {
  const num = Number(BigInt(value)) / Math.pow(10, decimals);
  if (num < 0.0001) return '<0.0001';
  return num.toLocaleString('en-US', { maximumFractionDigits: precision });
}

export function formatEth(wei: string, precision = 4): string {
  const eth = Number(BigInt(wei)) / 1e18;
  return eth.toLocaleString('en-US', { maximumFractionDigits: precision });
}

export function timeAgo(timestamp: string): string {
  const date = new Date(Number(timestamp) * 1000);
  const diff = Date.now() - date.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}
