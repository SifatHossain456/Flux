import Anthropic from '@anthropic-ai/sdk';
import {
  getEthBalance,
  getTokenList,
  getTransactions,
  getTokenTransfers,
  getBaseStats,
  getEthPrice,
  searchTokens,
} from '@/lib/basescan';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'get_portfolio',
    description:
      'Get full portfolio of a wallet on Base chain — ETH balance and all ERC-20 tokens with USD values.',
    input_schema: {
      type: 'object' as const,
      properties: {
        address: { type: 'string', description: 'Wallet address (0x...)' },
      },
      required: ['address'],
    },
  },
  {
    name: 'get_transactions',
    description: 'Get recent transactions for a wallet on Base chain.',
    input_schema: {
      type: 'object' as const,
      properties: {
        address: { type: 'string', description: 'Wallet address (0x...)' },
        limit: { type: 'number', description: 'How many to fetch (default 10, max 25)' },
      },
      required: ['address'],
    },
  },
  {
    name: 'get_token_transfers',
    description: 'Get ERC-20 token transfer history for a wallet on Base chain.',
    input_schema: {
      type: 'object' as const,
      properties: {
        address: { type: 'string', description: 'Wallet address (0x...)' },
        limit: { type: 'number', description: 'How many to fetch (default 10)' },
      },
      required: ['address'],
    },
  },
  {
    name: 'get_base_stats',
    description: 'Get current Base network stats: gas price (in gwei) and latest block number.',
    input_schema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'search_token',
    description: 'Search for any crypto token by name or symbol. Returns name, symbol, market cap rank.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Token name or symbol to search' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_eth_price',
    description: 'Get current ETH price in USD.',
    input_schema: { type: 'object' as const, properties: {} },
  },
];

async function runTool(name: string, input: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case 'get_portfolio': {
        const address = input.address as string;
        const [ethWei, tokens, ethPrice] = await Promise.all([
          getEthBalance(address),
          getTokenList(address),
          getEthPrice(),
        ]);
        const ethBal = Number(BigInt(ethWei)) / 1e18;
        const ethUSD = ethBal * ethPrice;
        const topTokens = tokens.slice(0, 15).map((t: Record<string, string>) => ({
          symbol: t.symbol,
          name: t.name,
          balance: (Number(BigInt(t.balance ?? '0')) / Math.pow(10, Number(t.decimals ?? 18))).toFixed(6),
          contract: t.contractAddress,
        }));
        return JSON.stringify({
          eth: { balance: ethBal.toFixed(6), valueUSD: ethUSD.toFixed(2), price: ethPrice },
          tokens: topTokens,
          tokenCount: tokens.length,
        });
      }

      case 'get_transactions': {
        const address = input.address as string;
        const limit = Math.min(Number(input.limit ?? 10), 25);
        const txs = await getTransactions(address, limit);
        return JSON.stringify(
          txs.map((t: Record<string, string>) => ({
            hash: t.hash,
            from: t.from,
            to: t.to,
            value: (Number(BigInt(t.value ?? '0')) / 1e18).toFixed(6) + ' ETH',
            age: new Date(Number(t.timeStamp) * 1000).toISOString(),
            status: t.isError === '0' ? 'success' : 'failed',
            method: t.functionName?.split('(')[0] || 'transfer',
          }))
        );
      }

      case 'get_token_transfers': {
        const address = input.address as string;
        const limit = Number(input.limit ?? 10);
        const transfers = await getTokenTransfers(address, limit);
        return JSON.stringify(
          transfers.map((t: Record<string, string>) => ({
            hash: t.hash,
            token: t.tokenSymbol,
            from: t.from,
            to: t.to,
            amount: (Number(BigInt(t.value ?? '0')) / Math.pow(10, Number(t.tokenDecimal ?? 18))).toFixed(4),
            age: new Date(Number(t.timeStamp) * 1000).toISOString(),
          }))
        );
      }

      case 'get_base_stats': {
        const stats = await getBaseStats();
        return JSON.stringify(stats);
      }

      case 'search_token': {
        const results = await searchTokens(input.query as string);
        return JSON.stringify(results);
      }

      case 'get_eth_price': {
        const price = await getEthPrice();
        return JSON.stringify({ ETH: price, currency: 'USD' });
      }

      default:
        return JSON.stringify({ error: 'Unknown tool' });
    }
  } catch (err) {
    return JSON.stringify({ error: String(err) });
  }
}

export async function POST(req: Request) {
  const { messages, walletAddress } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      try {
        let currentMessages: Anthropic.MessageParam[] = messages;

        for (let round = 0; round < 6; round++) {
          const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 4096,
            system: `You are Flux, an intelligent AI assistant for the Base blockchain ecosystem.
You have access to tools to fetch real on-chain data from Base.
${walletAddress ? `The user's connected wallet is: ${walletAddress}` : 'The user has not connected a wallet yet.'}

Guidelines:
- Be concise, helpful, and technically accurate.
- When showing addresses, always shorten them (first 6 + last 4 chars).
- Format numbers clearly: use commas for large numbers, 4 decimal places for ETH, 2 for USD.
- When the user asks about "my" wallet, use their connected address automatically.
- If no wallet is connected and they ask about their portfolio, kindly ask them to connect first.
- For send/swap requests, explain that they can use their wallet UI — Flux reads but does not sign transactions.
- Use markdown in your responses for better readability.
- Always show the Base explorer link for transaction hashes: https://basescan.org/tx/{hash}`,
            tools: TOOLS,
            messages: currentMessages,
          });

          const textBlocks = response.content.filter((b) => b.type === 'text');
          const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');

          if (textBlocks.length > 0) {
            send({ type: 'text', text: textBlocks.map((b) => (b as Anthropic.TextBlock).text).join('') });
          }

          if (response.stop_reason !== 'tool_use') break;

          const toolResults: Anthropic.ToolResultBlockParam[] = [];

          for (const tu of toolUseBlocks) {
            const toolUse = tu as Anthropic.ToolUseBlock;
            send({ type: 'tool_start', name: toolUse.name, input: toolUse.input });
            const result = await runTool(toolUse.name, toolUse.input as Record<string, unknown>);
            send({ type: 'tool_done', name: toolUse.name });
            toolResults.push({ type: 'tool_result', tool_use_id: toolUse.id, content: result });
          }

          currentMessages = [
            ...currentMessages,
            { role: 'assistant', content: response.content },
            { role: 'user', content: toolResults },
          ];
        }
      } catch (err) {
        send({ type: 'error', message: String(err) });
      }

      send({ type: 'done' });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  });
}
