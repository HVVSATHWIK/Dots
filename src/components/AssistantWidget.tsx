import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MessageCircle, X, Minus, Send } from 'lucide-react';
import { generateRaw, generateProductImages, speak } from '@/integrations/ai';
import { isFlagEnabled } from '@/lib/feature-flags';
import { AssistantMode } from '@/services/assistant/modes';
import { publish } from '@/lib/event-bus';
import { incr, METRIC } from '@/lib/metrics';

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
  const [mode, setMode] = React.useState<AssistantMode>(AssistantMode.General);
  const streamingEnabled = isFlagEnabled('assistantStreaming');
  const [isFallback, setIsFallback] = React.useState(false);
  const [activeModel, setActiveModel] = React.useState<string | null>(null);
  const [showFallbackInfo, setShowFallbackInfo] = React.useState(false);
  const [images, setImages] = React.useState<{ id: string; b64: string; mime: string }[]>([]);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [variantCount, setVariantCount] = React.useState(1);
  const aiImageGen = isFlagEnabled('aiImageGen');
  const aiTTS = isFlagEnabled('aiTTS');
  const aiVariants = isFlagEnabled('aiImageVariants');
  const aiAudioControls = isFlagEnabled('aiAudioControls');
  const [debugOpen, setDebugOpen] = React.useState(false);
  const [lastAttempts, setLastAttempts] = React.useState<any[]>([]);
  const [isImaging, setIsImaging] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const endRef = React.useRef<HTMLDivElement | null>(null);

  // Keyboard shortcuts: Ctrl/Cmd + Shift + K to toggle; Esc to close
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ua = navigator.userAgent || '';
      const isMac = /mac/i.test(ua);
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.shiftKey && (e.key === 'K' || e.key === 'k')) {
        e.preventDefault();
        setIsOpen(prev => {
          const next = !prev;
          publish('assistant.interaction', { mode: next ? 'open' : 'close' });
          return next;
        });
        if (!isOpen) setUnread(0);
      }
      if (e.key === 'Escape' && isOpen) {
        publish('assistant.interaction', { mode: 'close' });
        setIsOpen(false);
      }
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
    publish('assistant.interaction', { mode: streamingEnabled ? 'stream' : 'batch' });
    incr(METRIC.ASSISTANT_RUN);

    const userMsg: ChatMessage = { id: makeId(), role: 'user', content: text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      // Build a condensed prompt from prior turns (simple linear transcript)
      const history = messages
        .slice(-8)
        .map(m => `${m.role === 'assistant' ? 'Assistant' : m.role === 'user' ? 'User' : 'System'}: ${m.content}`)
        .join('\n');
  const prompt = history ? `${history}\nUser(${mode}): ${text}\nAssistant(${mode}):` : `User(${mode}): ${text}\nAssistant(${mode}):`;

      // Optimistic streaming placeholder message
      const botId = makeId();
      setMessages(prev => [...prev, { id: botId, role: 'assistant', content: '', ts: Date.now() }]);

      let streamed = false;
      try {
        const res = streamingEnabled ? await fetch('/api/ai/generate-stream', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ prompt })
        }) : null;
        if (streamingEnabled) {
          if (!res || !res.ok || !res.body) throw new Error('No stream');
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
                if (payload.fallback) setIsFallback(true);
                if (!isOpen) setUnread(u => u + 1);
                publish('assistant.interaction', { mode: 'stream.done' });
              }
            } catch { /* ignore parse */ }
          }
        }
        }
      } catch {
        // Fallback to non-streaming endpoint
      }
      if (!streamed) {
        try {
          const { reply, fallback, model } = await generateRaw(prompt) as any;
          if (fallback) {
            setIsFallback(true);
          } else {
            setIsFallback(false);
          }
          if (model) setActiveModel(model);
          setMessages(prev => prev.map(msg => msg.id === botId ? { ...msg, content: reply } : msg));
          if (!isOpen) setUnread(u => u + 1);
          publish('assistant.interaction', { mode: 'batch.done' });
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
        onClick={() => { setIsOpen(o => { const next = !o; publish('assistant.interaction', { mode: next ? 'open' : 'close' }); return next; }); if (!isOpen) setUnread(0); }}
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
            <div className="flex flex-col gap-1">
              <div className="text-sm font-medium">DOTS Assistant</div>
              <div className="flex gap-1 flex-wrap">
                {Object.values(AssistantMode).map(m => (
                  <button key={m} onClick={() => setMode(m)} className={`px-2 py-0.5 rounded text-xs border ${mode===m?'bg-primary text-primary-foreground':'bg-muted'}`}>{m}</button>
                ))}
                {streamingEnabled && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-600 text-white">stream</span>
                )}
                {!activeModel && isFallback && (
                  <button
                    type="button"
                    onClick={() => setShowFallbackInfo(o => !o)}
                    className="relative text-[10px] px-2 py-0.5 rounded bg-amber-500 text-black focus:outline-none focus:ring-1"
                    aria-expanded={showFallbackInfo}
                    aria-label="Local fallback mode info"
                    title="Local heuristic fallback (click for info)"
                  >local fallback
                {activeModel && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-600 text-white" title="Active Gemini model">{activeModel}</span>
                )}
                    {showFallbackInfo && (
                      <div role="tooltip" className="absolute z-10 top-full left-0 mt-1 w-64 text-[11px] p-2 rounded border bg-background shadow">
                        <p className="mb-1 font-medium">Heuristic Mode</p>
                        <p className="mb-1">Running without a Gemini API key. Responses use lightweight local rules.</p>
                        <p className="mb-1">Set <code className='font-mono'>GEMINI_API_KEY</code> (and optional <code className='font-mono'>GEMINI_MODEL</code>) in your environment or .env file then restart to enable full AI.</p>
                        <p className="text-muted-foreground">Badge disappears once real model replies are used.</p>
                      </div>
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
                {/* Image generate button */}
                {aiImageGen && <button
                  aria-label="Generate image"
                  disabled={isImaging || !input.trim()}
                  onClick={async () => {
                    const prompt = input.trim();
                    if (!prompt) return;
                    setIsImaging(true);
                    try {
                      const res = await generateProductImages(prompt, { variants: variantCount });
                      setLastAttempts(res.attempts || []);
                      const imgs = res.images || [];
                      if (imgs.length) {
                        const mapped = imgs.map(i => ({ id: makeId(), b64: i.b64, mime: i.mime }));
                        setImages(prev => [...mapped, ...prev]);
                        setSelectedImage(mapped[0].id);
                        publish('assistant.interaction', { mode: 'image.generate' });
                      }
                    } catch (e) {
                      setError('Image generation failed');
                    } finally {
                      setIsImaging(false);
                    }
                  }}
                  className="relative p-1 rounded hover:bg-accent disabled:opacity-50 text-[11px] border min-w-9 flex items-center justify-center"
                >{isImaging ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : 'IMG'}</button>}
                {/* TTS button */}
                {aiTTS && <button
                  aria-label="Speak last assistant reply"
                  disabled={isSpeaking || !messages.find(m=>m.role==='assistant')}
                  onClick={async () => {
                    const last = [...messages].reverse().find(m => m.role === 'assistant');
                    if (!last) return;
                    setIsSpeaking(true);
                    try {
                      const out = await speak(last.content);
                      const audioData = out.audio?.b64;
                      if (audioData) {
                        const src = `data:${out.audio.mime};base64,${audioData}`;
                        if (!audioRef.current) {
                          audioRef.current = new Audio();
                        }
                        audioRef.current.src = src;
                        try { await audioRef.current.play(); } catch { /* autoplay fail ignore */ }
                        publish('assistant.interaction', { mode: 'tts.play' });
                      }
                    } catch (e) {
                      setError('Speech synthesis failed');
                    } finally {
                      setIsSpeaking(false);
                    }
                  }}
                  className="relative p-1 rounded hover:bg-accent disabled:opacity-50 text-[11px] border min-w-9 flex items-center justify-center"
                >{isSpeaking ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : 'TTS'}</button>}
              <button aria-label="Debug attempts" onClick={() => setDebugOpen(o=>!o)} className="p-1 rounded hover:bg-accent text-[11px] border">DBG</button>
              <button aria-label="Minimize" onClick={() => { publish('assistant.interaction', { mode: 'close' }); setIsOpen(false); }} className="p-1 rounded hover:bg-accent">
                <Minus className="w-4 h-4" />
              </button>
              <button aria-label="Close" onClick={() => { publish('assistant.interaction', { mode: 'close' }); setIsOpen(false); }} className="p-1 rounded hover:bg-accent">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2" aria-live="polite">
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2" aria-label="Generated images gallery" role="list">
                {images.slice(0,12).map(img => (
                  <button type="button" key={img.id} role="listitem" onClick={() => setSelectedImage(img.id)} className={`relative group outline-none ${selectedImage===img.id?'ring-2 ring-primary':''}`}> 
                    <img src={`data:${img.mime};base64,${img.b64}`} alt="AI generated" className="w-16 h-16 object-cover rounded border" />
                    {selectedImage===img.id && <span className="absolute inset-0 rounded ring-2 ring-primary pointer-events-none" />}
                  </button>
                ))}
              </div>
            )}
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
              {aiVariants && aiImageGen && (
                <select value={variantCount} onChange={e=>setVariantCount(Number(e.target.value))} className="h-9 text-xs border rounded px-1">
                  {[1,2,3].map(v => <option key={v} value={v}>{v}x</option>)}
                </select>
              )}
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
            {selectedImage && (
              <div className="mt-2 flex gap-2">
                <button type="button" className="text-xs border px-2 py-1 rounded" onClick={() => {
                  const img = images.find(i=>i.id===selectedImage); if (!img) return;
                  navigator.clipboard?.writeText(`data:${img.mime};base64,${img.b64}`).catch(()=>{});
                }}>Copy Data URI</button>
                <button type="button" className="text-xs border px-2 py-1 rounded" onClick={() => {
                  const img = images.find(i=>i.id===selectedImage); if (!img) return;
                  const a = document.createElement('a');
                  a.href = `data:${img.mime};base64,${img.b64}`;
                  a.download = 'image.png';
                  document.body.appendChild(a); a.click(); a.remove();
                }}>Download</button>
              </div>
            )}
          </div>
          {debugOpen && (
            <div className="border-t max-h-24 overflow-auto text-[10px] p-2 space-y-1 bg-muted/30">
              <div className="font-medium">Model Attempts</div>
              {lastAttempts.length === 0 && <div className="opacity-60">None yet</div>}
              {lastAttempts.map((a,i)=>(
                <div key={i} className={a.ok? 'text-green-600' : 'text-red-600'}>{a.model}: {a.ok?'ok':a.error}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
