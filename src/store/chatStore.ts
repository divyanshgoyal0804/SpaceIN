import { create } from 'zustand';

export interface Property {
  id: string;
  title: string;
  slug: string;
  type: string;
  listingType: string;
  price?: number | null;
  rentPerMonth?: number | null;
  carpetArea?: number | null;
  location: string;
  furnished?: boolean | null;
  amenities?: string[];
  mainImageUrl?: string | null;
  videoUrl?: string | null;
  description?: string | null;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  propertyIds?: string[];
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: Date;
  title: string;
}

interface ChatStore {
  messages: Message[];
  isStreaming: boolean;
  currentResultProperties: Property[];
  sessions: ChatSession[];
  
  sendMessage: (content: string) => Promise<void>;
  startNewSession: () => void;
  loadSession: (sessionId: string) => void;
  setCurrentResultProperties: (props: Property[]) => void;
  initSessions: () => void;
}

const STORAGE_KEY = 'spacein_chat_sessions';

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isStreaming: false,
  currentResultProperties: [],
  sessions: [],

  initSessions: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          set({ sessions: parsed });
        } catch (e) {
          console.error("Failed to parse sessions", e);
        }
      }
    }
  },

  setCurrentResultProperties: (props: Property[]) => {
    set({ currentResultProperties: props });
  },

  startNewSession: () => {
    const { messages, sessions } = get();
    let newSessions = [...sessions];
    
    // Save current session if it has messages
    if (messages.length > 0) {
      const title = messages[0].content.substring(0, 40) + '...';
      const sessionId = Date.now().toString();
      const newSession: ChatSession = {
        id: sessionId,
        title,
        messages,
        createdAt: new Date(),
      };
      newSessions = [newSession, ...newSessions].slice(0, 20); // Keep max 20
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
      }
    }

    set({ 
      messages: [], 
      currentResultProperties: [], 
      sessions: newSessions 
    });
  },

  loadSession: (sessionId: string) => {
    const session = get().sessions.find((s) => s.id === sessionId);
    if (session) {
      set({ messages: session.messages, currentResultProperties: [] });
    }
  },

  sendMessage: async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const newMessages = [...get().messages, userMessage];
    set({ messages: newMessages, isStreaming: true });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.body) throw new Error('No readable stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      const assistantMessageId = (Date.now() + 1).toString();
      let assistantContent = '';

      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
          },
        ],
      }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                assistantContent += data.text;
                
                // Parse properties block if present at the end
                let cleanedContent = assistantContent;
                let propertyIds: string[] = [];
                
                const propMatch = assistantContent.match(/\[PROPERTIES:\s*(\{[\s\S]*?\})\s*\]/) || assistantContent.match(/\[PROPERTIES:([\s\S]*?)\]/);
                if (propMatch) {
                  try {
                    const parsedProps = JSON.parse(propMatch[1]);
                    if (parsedProps && Array.isArray(parsedProps.ids)) {
                      propertyIds = parsedProps.ids;
                    }
                    cleanedContent = assistantContent.replace(propMatch[0], '').trim();
                  } catch (e) {
                    console.error("Failed to parse properties block", e);
                  }
                }

                set((state) => ({
                  messages: state.messages.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, content: cleanedContent, propertyIds }
                      : m
                  ),
                }));
              }
            } catch (e) {
              console.error('Error parsing SSE:', e);
            }
          }
        }
      }
      
      // After stream complete, fetch properties if any exist in the last message
      const latestMessages = get().messages;
      const lastMessage = latestMessages[latestMessages.length - 1];
      if (lastMessage && lastMessage.propertyIds && lastMessage.propertyIds.length > 0) {
        try {
          const res = await fetch('/api/properties?limit=20');
          const data = await res.json();
          // The API could return {properties: Property[]} but let's assume an array or generic
          const propsArray = data.properties || data.data || data;
          if (Array.isArray(propsArray)) {
            const matchedProps = propsArray.filter((p: any) => lastMessage.propertyIds!.includes(p.id));
            set({ currentResultProperties: matchedProps });
          }
        } catch (e) {
          console.error("Failed to fetch full properties for ids", e);
        }
      } else if (lastMessage && lastMessage.propertyIds && lastMessage.propertyIds.length === 0) {
        // empty properties array means 0 results
        set({ currentResultProperties: [] });
      }

    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      // check if we need to auto save session
      set({ isStreaming: false });
    }
  },
}));
