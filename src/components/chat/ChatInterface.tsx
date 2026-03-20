'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface PropertySuggestion {
  id: string;
  title: string;
  slug: string;
  type: string;
  price: number | null;
  rentPerMonth: number | null;
  carpetArea: number;
  location: string;
  mainImageUrl: string;
}

const suggestedPrompts = [
  "Show me furnished offices under ₹50,000/month in Noida",
  "I need a warehouse with loading bay, 3,000+ sq ft",
  "What coworking spaces are available near Sector 62?",
  "Compare office options under ₹1 Cr for purchase",
];

function parsePropertyIds(text: string): string[] {
  const match = text.match(/\[PROPERTIES:\{["\']ids["\']:\[([^\]]*)\]\}\]/);
  if (!match) return [];
  const idsStr = match[1];
  return idsStr.match(/["']([^"']+)["']/g)?.map(s => s.replace(/["']/g, '')) || [];
}

function cleanMessageText(text: string): string {
  return text.replace(/\[PROPERTIES:\{[^\]]*\]\}\]/g, '').trim();
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [propertyMap, setPropertyMap] = useState<Record<string, PropertySuggestion>>({});
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchPropertyDetails(ids: string[]) {
    const newProps: Record<string, PropertySuggestion> = {};
    for (const id of ids) {
      if (propertyMap[id]) continue;
      try {
        const res = await fetch(`/api/properties/${id}`);
        if (res.ok) {
          const prop = await res.json();
          newProps[id] = prop;
        }
      } catch (e) {
        console.error('Failed to fetch property:', e);
      }
    }
    if (Object.keys(newProps).length > 0) {
      setPropertyMap(prev => ({ ...prev, ...newProps }));
    }
  }

  async function handleSubmit(e?: FormEvent, overrideInput?: string) {
    e?.preventDefault();
    const text = overrideInput || input.trim();
    if (!text || isStreaming) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('Chat request failed');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                assistantContent += parsed.text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: assistantContent,
                  };
                  return updated;
                });
              }
            } catch {
              // skip invalid JSON
            }
          }
        }
      }

      // Parse property IDs from final response
      const ids = parsePropertyIds(assistantContent);
      if (ids.length > 0) {
        await fetchPropertyDetails(ids);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          role: 'assistant',
          content: "I'm sorry, I'm having trouble connecting right now. Please try again or contact us directly.",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }

  function handlePromptClick(prompt: string) {
    handleSubmit(undefined, prompt);
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Chat Area */}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty__icon">
                <Bot size={40} />
              </div>
              <h2>SpaceIn AI Assistant</h2>
              <p>Ask me anything about commercial spaces in Noida</p>
              <div className="suggested-grid">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    className="suggested-card glass-card"
                    onClick={() => handlePromptClick(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              const propertyIds = msg.role === 'assistant' ? parsePropertyIds(msg.content) : [];
              const cleanContent = msg.role === 'assistant' ? cleanMessageText(msg.content) : msg.content;

              return (
                <div key={i} className={`chat-msg chat-msg--${msg.role}`}>
                  <div className="chat-msg__avatar">
                    {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                  </div>
                  <div className="chat-msg__content">
                    <div className="chat-msg__text" style={{ whiteSpace: 'pre-wrap' }}>
                      {cleanContent}
                      {isStreaming && i === messages.length - 1 && msg.role === 'assistant' && (
                        <span className="typing-cursor">▊</span>
                      )}
                    </div>
                    {/* Inline property cards */}
                    {propertyIds.length > 0 && (
                      <div className="property-suggestions">
                        {propertyIds.map(id => {
                          const prop = propertyMap[id];
                          if (!prop) return null;
                          return (
                            <Link
                              key={id}
                              href={`/properties/${prop.slug}`}
                              className="property-suggestion-card glass-card"
                            >
                              <div className="psc-image">
                                <Image
                                  src={prop.mainImageUrl}
                                  alt={prop.title}
                                  width={80}
                                  height={60}
                                  style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: '8px' }}
                                />
                              </div>
                              <div className="psc-info">
                                <div className="psc-title">{prop.title}</div>
                                <div className="psc-meta">
                                  {prop.carpetArea.toLocaleString('en-IN')} sq ft · {prop.location}
                                </div>
                                <div className="psc-price" style={{ color: 'var(--accent)' }}>
                                  {prop.rentPerMonth
                                    ? `₹${prop.rentPerMonth.toLocaleString('en-IN')}/mo`
                                    : prop.price
                                    ? `₹${prop.price.toLocaleString('en-IN')}`
                                    : 'Contact for price'}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>

        {/* Input Area */}
        <form className="chat-input-area" onSubmit={handleSubmit}>
          <div className="chat-input-wrap">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about commercial spaces in Noida..."
              rows={1}
              className="chat-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="chat-send"
            >
              {isStreaming ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .chat-page {
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding-top: 64px;
          background: var(--bg-primary);
        }

        .chat-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .chat-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 1rem;
        }

        .chat-empty__icon {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: rgba(var(--accent-rgb), 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
        }

        .chat-empty h2 {
          font-size: 1.5rem;
        }

        .chat-empty p {
          color: var(--text-muted);
        }

        .suggested-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          max-width: 500px;
          margin-top: 1rem;
        }

        .suggested-card {
          text-align: left;
          font-size: 0.85rem;
          color: var(--text-secondary);
          cursor: pointer;
          border: none;
          font-family: inherit;
          line-height: 1.4;
        }

        .suggested-card:hover {
          color: var(--text-primary);
        }

        .chat-msg {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .chat-msg__avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .chat-msg--assistant .chat-msg__avatar {
          background: rgba(var(--accent-rgb), 0.1);
          color: var(--accent);
        }

        .chat-msg--user .chat-msg__avatar {
          background: var(--glass-bg);
          color: var(--text-primary);
        }

        .chat-msg__content {
          flex: 1;
          min-width: 0;
        }

        .chat-msg__text {
          font-size: 0.95rem;
          line-height: 1.7;
          color: var(--text-primary);
        }

        .typing-cursor {
          animation: blink 0.7s infinite;
          color: var(--accent);
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .property-suggestions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .property-suggestion-card {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem;
          text-decoration: none;
        }

        .psc-image {
          width: 80px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .psc-info {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .psc-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .psc-meta {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .psc-price {
          font-size: 0.85rem;
          font-weight: 600;
        }

        .chat-input-area {
          padding: 1rem 1.5rem 1.5rem;
          border-top: 1px solid var(--border);
        }

        .chat-input-wrap {
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 14px;
          padding: 0.5rem;
          transition: border-color 0.2s ease;
        }

        .chat-input-wrap:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.1);
        }

        .chat-input {
          flex: 1;
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 0.95rem;
          font-family: inherit;
          padding: 0.5rem;
          resize: none;
          outline: none;
          max-height: 120px;
        }

        .chat-input::placeholder {
          color: var(--text-muted);
        }

        .chat-send {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: none;
          background: var(--accent);
          color: var(--accent-foreground, #000);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .chat-send:hover:not(:disabled) {
          background: var(--accent-hover);
        }

        .chat-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        :global(.spin) {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .suggested-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
