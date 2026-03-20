'use client';
import { useChatStore } from '@/store/chatStore';
import { useRef, useEffect, useState } from 'react';
import styles from './chat.module.css';
import ChatMessage from './ChatMessage';
import MobileChatInput from './MobileChatInput';
import MobileHistoryDrawer from './MobileHistoryDrawer';

export default function MobileChatLayout() {
  const { messages, startNewSession, isStreaming } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  useEffect(() => {
    const handleResize = () => {
      bottomRef.current?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
    };
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  const handleSuggestion = (q: string) => {
    // Actually handle input send if not streaming
    if (!isStreaming) {
      useChatStore.getState().sendMessage(q);
    }
  };

  return (
    <div className={styles.mobileChatWrapper}>
      <div className={styles.mobileChatHeader}>
        <button className={styles.mobileHeaderHistoryBtn} onClick={() => setDrawerOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          History
        </button>
        <div className={styles.mobileHeaderTitle}>SpaceIn AI</div>
        <button className={styles.mobileHeaderNewBtn} onClick={() => startNewSession()}>
          + New
        </button>
      </div>

      <div className={styles.mobileMessagesArea}>
        {messages.length === 0 ? (
          <div className={styles.mobileEmptyState}>
            <svg className={styles.mobileEmptyIcon} xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
              <path d="M9 22v-4h6v4"></path>
              <path d="M8 6h.01"></path>
              <path d="M16 6h.01"></path>
              <path d="M12 6h.01"></path>
              <path d="M12 10h.01"></path>
              <path d="M12 14h.01"></path>
              <path d="M16 10h.01"></path>
              <path d="M16 14h.01"></path>
              <path d="M8 10h.01"></path>
              <path d="M8 14h.01"></path>
            </svg>
            <div className={styles.mobileEmptyTitle}>What are you looking for today?</div>
            <div className={styles.mobileEmptySubtitle}>Describe your ideal commercial space and I'll find it for you.</div>
            
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              {[
                'Furnished office under ₹50K/month',
                'Warehouse with loading bay, 3000+ sq ft',
                'Coworking space near Sector 62',
                'Retail space for sale under ₹1 Cr'
              ].map(chip => (
                <button 
                  key={chip} 
                  className={styles.mobileSuggestionChip}
                  onClick={() => handleSuggestion(chip)}
                >
                  {chip}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <ChatMessage key={msg.id || i} message={msg} isMobile={true} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <MobileChatInput onOpenHistory={() => setDrawerOpen(true)} />
      
      <MobileHistoryDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
      />
    </div>
  );
}
