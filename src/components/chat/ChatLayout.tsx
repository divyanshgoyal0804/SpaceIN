'use client';
import { useEffect, useState } from 'react';
import styles from './chat.module.css';
import ChatPanel from './ChatPanel';
import ResultsPanel from './ResultsPanel';
import MobileChatLayout from './MobileChatLayout';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  
  return isMobile;
}

function DesktopChatLayout() {
  return (
    <div className={styles.chatContainer}>
      <div className={styles.leftPanel}>
        <ChatPanel />
      </div>
      <div className={styles.rightPanel}>
        <ResultsPanel />
      </div>
    </div>
  );
}

export default function ChatLayout() {
  const isMobile = useIsMobile();
  
  // Important fallback during SSR so it doesn't mismatch hydration visually
  // but hook checks client-side width immediately.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  // Just return desktop initially to preserve server formatting
  // if not mounted, we avoid hydration text jump.
  if (!mounted) return <DesktopChatLayout />;

  if (isMobile) return <MobileChatLayout />;
  return <DesktopChatLayout />;
}
