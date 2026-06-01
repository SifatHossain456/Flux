'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import {
  Send, Bot, User, Loader2, Zap, Wallet, TrendingUp, Search, Activity,
} from 'lucide-react';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface ToolCall {
  name: string;
  status: 'running' | 'done';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCall[];
  isStreaming?: boolean;
}

const TOOL_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  get_portfolio: { label: 'Fetching portfolio...', icon: Wallet },
  get_transactions: { label: 'Loading transactions...', icon: Activity },
  get_token_transfers: { label: 'Loading token transfers...', icon: TrendingUp },
  get_base_stats: { label: 'Checking Base network...', icon: Zap },
  search_token: { label: 'Searching tokens...', icon: Search },
  get_eth_price: { label: 'Fetching ETH price...', icon: TrendingUp },
};

const QUICK_PROMPTS = [
  { label: 'My portfolio', prompt: 'Show me my portfolio balance and tokens' },
  { label: 'Recent txns', prompt: 'Show my last 10 transactions' },
  { label: 'Gas price', prompt: 'What is the current gas price on Base?' },
  { label: 'ETH price', prompt: 'What is ETH trading at right now?' },
];

function ToolCallBadge({ tc }: { tc: ToolCall }) {
  const meta = TOOL_LABELS[tc.name] ?? { label: tc.name, icon: Zap };
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-flux-blue-dim border border-flux-blue-border text-[11px] text-flux-muted w-fit">
      {tc.status === 'running' ? (
        <Loader2 size={11} className="animate-spin text-flux-blue-light" />
      ) : (
        <Icon size={11} className="text-flux-success" />
      )}
      <span>{meta.label}</span>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <div
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
          isUser ? 'bg-flux-blue' : 'bg-flux-blue-dim border border-flux-blue-border'
        )}
      >
        {isUser ? <User size={13} className="text-white" /> : <Bot size={13} className="text-flux-blue-light" />}
      </div>

      <div className={cn('flex flex-col gap-1.5 max-w-[85%]', isUser ? 'items-end' : 'items-start')}>
        {/* Tool calls */}
        {msg.toolCalls && msg.toolCalls.length > 0 && (
          <div className="flex flex-col gap-1">
            {msg.toolCalls.map((tc, i) => (
              <ToolCallBadge key={i} tc={tc} />
            ))}
          </div>
        )}

        {/* Content */}
        {msg.content && (
          <div
            className={cn(
              'px-4 py-3 rounded-2xl text-sm leading-relaxed',
              isUser
                ? 'bg-flux-blue text-white rounded-tr-sm'
                : 'bg-flux-card border border-flux-blue-border text-flux-text rounded-tl-sm'
            )}
          >
            {isUser ? (
              <p>{msg.content}</p>
            ) : (
              <div className="prose prose-sm prose-invert max-w-none prose-code:text-flux-blue-light prose-a:text-flux-blue-light">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            )}
            {msg.isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-flux-blue-light ml-0.5 animate-pulse rounded-sm" />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ChatPanel() {
  const { address, isConnected } = useAccount();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `## Welcome to Flux AI ⚡

I'm your intelligent Base chain assistant powered by **Claude + Base MCP**.

I can help you:
- 📊 **Check portfolio** & token balances
- 📜 **View transactions** & token transfers
- 🔍 **Search any token** on CoinGecko
- ⛽ **Monitor gas** & network stats
- 💡 **Answer questions** about Base & DeFi

${isConnected ? `Your wallet \`${address?.slice(0, 6)}...${address?.slice(-4)}\` is connected. Ask me anything!` : '**Connect your wallet** to unlock portfolio features.'}`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setInput('');
    setIsLoading(true);

    const userMsg: Message = { id: generateId(), role: 'user', content: text };
    const assistantId = generateId();
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '', toolCalls: [], isStreaming: true };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    const history = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, content: m.content }));
    history.push({ role: 'user', content: text });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, walletAddress: address }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') continue;
          try {
            const evt = JSON.parse(raw);
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== assistantId) return m;
                if (evt.type === 'text') return { ...m, content: m.content + evt.text };
                if (evt.type === 'tool_start') {
                  return { ...m, toolCalls: [...(m.toolCalls ?? []), { name: evt.name, status: 'running' as const }] };
                }
                if (evt.type === 'tool_done') {
                  return {
                    ...m,
                    toolCalls: (m.toolCalls ?? []).map((tc) =>
                      tc.name === evt.name && tc.status === 'running' ? { ...tc, status: 'done' as const } : tc
                    ),
                  };
                }
                if (evt.type === 'done') return { ...m, isStreaming: false };
                if (evt.type === 'error') return { ...m, content: m.content + `\n\n⚠️ Error: ${evt.message}`, isStreaming: false };
                return m;
              })
            );
          } catch { /* skip malformed events */ }
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: `Error: ${String(err)}`, isStreaming: false } : m))
      );
    }

    setIsLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="flex flex-col h-full glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-flux-blue-border flex-shrink-0">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-flux-blue-dim border border-flux-blue-border flex items-center justify-center">
            <Bot size={16} className="text-flux-blue-light" />
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-flux-success rounded-full border-2 border-flux-card" />
        </div>
        <div>
          <p className="text-sm font-semibold text-flux-text">Flux AI Agent</p>
          <p className="text-[10px] text-flux-muted">Claude · Base MCP · Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
          {QUICK_PROMPTS.map((qp) => (
            <button
              key={qp.label}
              onClick={() => send(qp.prompt)}
              className="text-[11px] px-3 py-1.5 rounded-lg border border-flux-blue-border bg-flux-blue-dim text-flux-muted hover:text-flux-blue-light hover:border-flux-blue transition-all"
            >
              {qp.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 flex-shrink-0">
        <div className="flex items-end gap-2 glass-card rounded-xl px-3 py-2.5 glow-border border border-flux-blue-border">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about your portfolio, transactions, tokens..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-flux-text placeholder:text-flux-muted resize-none outline-none leading-relaxed max-h-24"
            style={{ minHeight: '24px' }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || isLoading}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0',
              input.trim() && !isLoading
                ? 'bg-flux-blue hover:bg-flux-blue-light text-white shadow-lg shadow-flux-blue/30'
                : 'bg-flux-blue-dim text-flux-muted cursor-not-allowed'
            )}
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
        <p className="text-[10px] text-flux-muted text-center mt-2 opacity-50">
          Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}
