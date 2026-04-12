'use client';
import { useChatStore } from '@/store/chatStore';
import { useEffect, useRef } from 'react';
import styles from './chat.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileHistoryDrawer({ isOpen, onClose }: Props) {
  const { sessions, startNewSession, loadSession } = useChatStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleNewChat = () => {
    startNewSession();
    onClose();
  };

  const handleLoad = (id: string) => {
    loadSession(id);
    onClose();
  };

  // Swipe logic
  useEffect(() => {
    let startX = 0;
    const node = drawerRef.current;
    if (!node) return;

    const handleTouchStart = (e: TouchEvent) => { 
      startX = e.touches[0].clientX; 
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (diff > 60) onClose(); // swiped left 60px+
    };

    node.addEventListener('touchstart', handleTouchStart, { passive: true });
    node.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      node.removeEventListener('touchstart', handleTouchStart);
      node.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onClose]);

  return (
    <>
      <div 
        className={`${styles.historyBackdrop} ${isOpen ? styles.open : ''}`}
        onClick={onClose}
      />
      
      <div 
        ref={drawerRef}
        className={`${styles.historyDrawer} ${isOpen ? styles.open : ''}`}
      >
        <div className={styles.historyDrawerHeader}>
          <div className={styles.drawerTitle} style={{ fontWeight: 600, fontSize: 16 }}>History</div>
        </div>
        
        <button className={styles.historyNewChatBtn} onClick={handleNewChat}>
          + New Chat
        </button>

        <div className={styles.historySessionsList}>
          {sessions.map(s => (
            <div key={s.id} className={styles.historySessionItem} onClick={() => handleLoad(s.id)}>
              <div className={styles.historySessionTitle}>{s.title}</div>
              <div className={styles.historySessionMeta}>
                {new Date(s.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
