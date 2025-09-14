import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MessageCircle, X, Minus, Send } from 'lucide-react';
import { generate as generateApi } from '@/integrations/ai';

type ChatRole = 'user' | 'assistant' | 'system';
interface ChatMessage { id: string; role: ChatRole; content: string; ts: number }

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function AssistantWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [unread, setUnread] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);
  const endRef = React.useRef<HTMLDivElement | null>(null);

  // Keyboard shortcuts: Ctrl/Cmd + Shift + K to toggle; Esc to close
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ua = navigator.userAgent || '';
      const isMac = /mac/i.test(ua);
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.shiftKey && (e.key === 'K' || e.key === 'k')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
        if (!isOpen) setUnread(0);
      }
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  // Focus input on open
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);
  React.useEffect(() => {
    if (isOpen) {
      setUnread(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  // Auto-scroll to the latest message
  React.useEffect(() => {
    if (!isOpen) return;
    // Smoothly bring the latest message into view
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }));
  }, [messages, isSending, isOpen]);

  const send = async () => {
    const text = input.trim();
    if (!text || isSending) return;
    setError(null);
    setIsSending(true);

    const userMsg: ChatMessage = { id: makeId(), role: 'user', content: text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      // Build a condensed prompt from prior turns (simple linear transcript)
      const history = messages
        .slice(-8)
        .map(m => `${m.role === 'assistant' ? 'Assistant' : m.role === 'user' ? 'User' : 'System'}: ${m.content}`)
        .join('\n');
      const prompt = history ? `${history}\nUser: ${text}\nAssistant:` : `User: ${text}\nAssistant:`;

      // Optimistic streaming placeholder message
      const botId = makeId();
      setMessages(prev => [...prev, { id: botId, role: 'assistant', content: '', ts: Date.now() }]);

      let streamed = false;
      try {
        const res = await fetch('/api/ai/generate-stream', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        if (!res.ok || !res.body) throw new Error('No stream');
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = '';
        while (true) {
          const { value, done } = await reader.read();
            if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          // Parse SSE lines
          const lines = chunk.split(/\n\n/).filter(Boolean);
          for (const l of lines) {
            const m = l.match(/^data: (.*)$/m);
            if (!m) continue;
            try {
              const payload = JSON.parse(m[1]);
              if (payload.token) {
                full += payload.token;
                streamed = true;
                setMessages(prev => prev.map(msg => msg.id === botId ? { ...msg, content: full } : msg));
              }
              if (payload.done) {
                if (!isOpen) setUnread(u => u + 1);
              }
            } catch { /* ignore parse */ }
          }
        }
      } catch {
        // Fallback to non-streaming endpoint
      }
      if (!streamed) {
        try {
          const replyText = await generateApi(prompt);
          setMessages(prev => prev.map(msg => msg.id === botId ? { ...msg, content: replyText } : msg));
          if (!isOpen) setUnread(u => u + 1);
        } catch (e) {
          setMessages(prev => prev.filter(m => m.id !== botId));
          throw e;
        }
      }
    } catch (e) {
      setError('Sorry, the assistant is unavailable. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        title="Ask DOTS Assistant"
        aria-label="Open DOTS Assistant"
        onClick={() => { setIsOpen(o => !o); if (!isOpen) setUnread(0); }}
  className="fixed bottom-4 right-4 z-[100] inline-flex items-center justify-center rounded-full shadow-lg border bg-background/90 backdrop-blur-md w-12 h-12 hover:shadow-xl"
      >
        <MessageCircle className="w-6 h-6" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
            {unread}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="DOTS Assistant"
          className="fixed bottom-20 right-4 z-[100] w-[360px] max-w-[calc(100vw-2rem)] h-[480px] max-h-[70vh] rounded-2xl border bg-background shadow-xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className="text-sm font-medium">DOTS Assistant</div>
            <div className="flex items-center gap-1">
              <button aria-label="Minimize" onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-accent">
                <Minus className="w-4 h-4" />
              </button>
              <button aria-label="Close" onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-accent">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2" aria-live="polite">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">Ask about titles, tags, pricing, or photography tips…</p>
            )}
            {messages.map(m => (
              <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={[
                  'inline-block rounded-2xl px-3 py-2 text-sm text-left whitespace-pre-wrap break-words',
                  m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                ].join(' ')}>
                  {m.role === 'assistant' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="text-left">
                <div className="inline-block rounded-2xl px-3 py-2 text-sm bg-muted">Typing…</div>
              </div>
            )}
            {error && (
              <div role="status" aria-live="polite" className="text-sm text-red-600">{error}</div>
            )}
            <div ref={endRef} />
          </div>

          {/* Composer */}
          <div className="border-t p-2">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask for help with titles, tags, pricing…"
                rows={1}
                className="flex-1 resize-none rounded-xl border px-3 py-2 text-sm outline-none focus:ring-1"
              />
              <button
                onClick={() => void send()}
                disabled={isSending || !input.trim()}
                className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> Send
              </button>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Enter to send • Shift+Enter for newline • Ctrl/Cmd+Shift+K toggles assistant
            </div>
          </div>
        </div>
      )}
    </>
  );
}
