export interface TokenBalance {
  symbol: string;
  name: string;
  contractAddress: string;
  balance: string;
  decimals: number;
  tokenPriceUSD?: number;
  valueUSD?: number;
  logo?: string;
  change24h?: number;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  isError: string;
  functionName?: string;
  tokenSymbol?: string;
  tokenDecimal?: string;
  gasUsed: string;
  gasPrice: string;
  blockNumber: string;
}

export interface BaseStats {
  gasGwei: string;
  blockNumber: number;
  tps?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
  isStreaming?: boolean;
}

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
  result?: string;
}

export interface Portfolio {
  ethBalance: number;
  ethValueUSD: number;
  tokens: TokenBalance[];
  totalValueUSD: number;
}
