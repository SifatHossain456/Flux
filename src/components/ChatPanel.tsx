'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import {
  Send, Bot, User, Loader2, Zap, Wallet, TrendingUp, Search, Activity,
  Copy, Check, Trash2, ChevronDown,
} from 'lucide-react';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface ToolCall  { name: string; status: 'running' | 'done'; }
interface Message   {
  id: string; role: 'user' | 'assistant'; content: string;
  toolCalls?: ToolCall[]; isStreaming?: boolean; timestamp: Date;
}

const TOOL_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  get_portfolio:       { label: 'Fetching portfolio',      icon: Wallet,      color: '#3B82F6' },
  get_transactions:    { label: 'Loading transactions',    icon: Activity,    color: '#8B5CF6' },
  get_token_transfers: { label: 'Loading token transfers', icon: TrendingUp,  color: '#06B6D4' },
  get_base_stats:      { label: 'Checking Base network',   icon: Zap,         color: '#F59E0B' },
  search_token:        { label: 'Searching tokens',        icon: Search,      color: '#10B981' },
  get_eth_price:       { label: 'Fetching ETH price',      icon: TrendingUp,  color: '#EC4899' },
};

const QUICK_PROMPTS = [
  { label: '📊 Portfolio',   prompt: 'Show me my portfolio balance and all tokens'  },
  { label: '📜 Activity',    prompt: 'Show my last 10 transactions'                  },
  { label: '⛽ Gas',         prompt: 'What is the current gas price on Base?'        },
  { label: '💰 ETH Price',   prompt: 'What is ETH trading at right now?'             },
];

function ToolBadge({ tc }: { tc: ToolCall }) {
  const meta = TOOL_META[tc.name] ?? { label: tc.name, icon: Zap, color: '#6B8DB8' };
  const Icon = meta.icon;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium"
      style={{
        background: `${meta.color}12`,
        border: `1px solid ${meta.color}25`,
        color: tc.status === 'done' ? meta.color : '#6B8DB8',
      }}
    >
      {tc.status === 'running'
        ? <Loader2 size={10} className="animate-spin" style={{ color: meta.color }} />
        : <Icon size={10} style={{ color: meta.color }} />
      }
      <span style={{ color: tc.status === 'done' ? meta.color : undefined }}>{meta.label}</span>
      {tc.status === 'running' && <span className="text-[10px] opacity-60">...</span>}
      {tc.status === 'done'    && <Check size={9} style={{ color: meta.color }} />}
    </motion.div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);
  return (
    <button onClick={copy}
      className="opacity-0 group-hover:opacity-100 transition-all p-1 rounded-md hover:bg-white/8 text-flux-muted hover:text-flux-text"
    >
      {copied ? <Check size={11} className="text-flux-success" /> : <Copy size={11} />}
    </button>
  );
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className={cn('flex gap-2.5 group', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
        isUser
          ? 'bg-gradient-to-br from-flux-blue to-blue-500'
          : 'border border-white/10 bg-white/5'
      )}>
        {isUser
          ? <User size={12} className="text-white" />
          : <Bot  size={12} className="text-flux-blue-light" />
        }
      </div>

      <div className={cn('flex flex-col gap-1 max-w-[88%]', isUser ? 'items-end' : 'items-start')}>
        {/* Tool calls */}
        {msg.toolCalls && msg.toolCalls.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1">
            {msg.toolCalls.map((tc, i) => <ToolBadge key={i} tc={tc} />)}
          </div>
        )}

        {/* Content bubble */}
        {(msg.content || msg.isStreaming) && (
          <div className={cn(
            'relative px-4 py-3 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'text-white rounded-tr-sm'
              : 'text-flux-text-2 rounded-tl-sm border border-white/7'
          )}
          style={isUser
            ? { background: 'linear-gradient(135deg, #0052FF, #3B82F6)' }
            : { background: 'rgba(255,255,255,0.04)' }
          }>
            {isUser ? (
              <p>{msg.content}</p>
            ) : (
              <div className="chat-prose">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
                {msg.isStreaming && (
                  <span className="inline-block w-1.5 h-4 bg-flux-blue-light/70 ml-0.5 animate-pulse rounded-sm align-middle" />
                )}
              </div>
            )}

            {/* Copy button for assistant */}
            {!isUser && msg.content && !msg.isStreaming && (
              <div className="absolute -top-2 -right-2">
                <CopyButton text={msg.content} />
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-flux-muted/40 px-1">{formatTime(msg.timestamp)}</span>
      </div>
    </motion.div>
  );
}

function ThinkingIndicator() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
      <div className="w-7 h-7 rounded-full border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0">
        <Bot size={12} className="text-flux-blue-light" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm border border-white/7 bg-white/4">
        <div className="flex items-center gap-1.5">
          {[0, 0.15, 0.3].map(d => (
            <motion.div key={d} className="w-1.5 h-1.5 rounded-full bg-flux-blue-light/60"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 1.2, delay: d, repeat: Infinity }} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ChatPanel() {
  const { address } = useAccount();
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome', role: 'assistant', timestamp: new Date(),
    content: `## Flux AI Agent ⚡\n\nI'm your intelligent Base chain assistant powered by **Claude + Base MCP**.\n\n**I can help you:**\n- 📊 Check portfolio & token balances\n- 📜 View transaction history & token transfers\n- 🔍 Search any crypto token\n- ⛽ Monitor gas prices & network stats\n- 💡 Answer questions about Base & DeFi\n\n${address ? `Wallet \`${address.slice(0,6)}...${address.slice(-4)}\` connected — ask me anything!` : 'Connect your wallet to unlock portfolio features.'}`,
  }]);
  const [input, setInput]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const scrollRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 80);
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome', role: 'assistant', timestamp: new Date(),
      content: `## Flux AI Agent ⚡\n\nChat cleared. ${address ? 'Ask me about your wallet!' : 'Connect your wallet to get started.'}`,
    }]);
  };

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setInput('');
    setIsLoading(true);

    const userMsg: Message    = { id: generateId(), role: 'user',      content: text, timestamp: new Date() };
    const assistantId = generateId();
    const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '', toolCalls: [], isStreaming: true, timestamp: new Date() };
    setMessages(p => [...p, userMsg, assistantMsg]);

    const history = messages.filter(m => m.id !== 'welcome').map(m => ({ role: m.role, content: m.content }));
    history.push({ role: 'user', content: text });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, walletAddress: address }),
      });
      const reader  = res.body!.getReader();
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
          try {
            const evt = JSON.parse(line.slice(6).trim());
            setMessages(prev => prev.map(m => {
              if (m.id !== assistantId) return m;
              if (evt.type === 'text')       return { ...m, content: m.content + evt.text };
              if (evt.type === 'tool_start') return { ...m, toolCalls: [...(m.toolCalls??[]), { name: evt.name, status: 'running' as const }] };
              if (evt.type === 'tool_done')  return { ...m, toolCalls: (m.toolCalls??[]).map(tc => tc.name===evt.name&&tc.status==='running' ? {...tc,status:'done' as const} : tc) };
              if (evt.type === 'done')       return { ...m, isStreaming: false };
              if (evt.type === 'error')      return { ...m, content: m.content + `\n\n⚠️ ${evt.message}`, isStreaming: false };
              return m;
            }));
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      setMessages(prev => prev.map(m => m.id===assistantId ? {...m, content:`Error: ${String(err)}`, isStreaming:false} : m));
    }
    setIsLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{ background: 'rgba(6,11,22,0.8)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/6 flex-shrink-0">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-white/6 border border-white/10 flex items-center justify-center">
            <Bot size={15} className="text-flux-blue-light" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-flux-success rounded-full border-2 border-[#060B16]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-flux-text">Flux AI</p>
          <p className="text-[10px] text-flux-muted">Claude · Base MCP · Online</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={clearChat}
            className="p-1.5 rounded-lg text-flux-muted hover:text-flux-danger hover:bg-flux-danger/10 transition-all"
            title="Clear chat"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-5 space-y-5 relative"
      >
        <AnimatePresence initial={false}>
          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
          {isLoading && !messages[messages.length-1]?.isStreaming && <ThinkingIndicator />}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Scroll-to-bottom button */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            onClick={scrollToBottom}
            className="absolute bottom-[90px] right-6 z-10 p-1.5 rounded-full border border-white/10 bg-[#060B16]/90 text-flux-muted hover:text-flux-text transition-all"
          >
            <ChevronDown size={14} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Quick prompts — only on welcome */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
          {QUICK_PROMPTS.map(qp => (
            <button key={qp.label} onClick={() => send(qp.prompt)}
              className="text-[11px] font-medium px-3 py-1.5 rounded-xl border border-white/8 bg-white/4 text-flux-muted hover:text-flux-text hover:border-flux-blue/40 hover:bg-flux-blue/8 transition-all"
            >
              {qp.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 flex-shrink-0">
        <div
          className="flex items-end gap-2.5 rounded-xl px-3.5 py-2.5 glow-border transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about your portfolio, swaps, gas, tokens…"
            rows={1}
            className="flex-1 bg-transparent text-sm text-flux-text placeholder:text-flux-muted/50 resize-none outline-none leading-relaxed"
            style={{ minHeight: '22px', maxHeight: '120px' }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || isLoading}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 mb-0.5',
              input.trim() && !isLoading
                ? 'text-white'
                : 'bg-white/5 text-flux-muted/40 cursor-not-allowed'
            )}
            style={input.trim() && !isLoading ? {
              background: 'linear-gradient(135deg, #0052FF, #4D8EFF)',
              boxShadow: '0 0 12px rgba(0,82,255,0.4)',
            } : {}}
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
        <p className="text-[10px] text-flux-muted/30 text-center mt-2">
          Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}
