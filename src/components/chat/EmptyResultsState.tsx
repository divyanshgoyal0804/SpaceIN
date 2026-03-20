'use client';
import { useChatStore } from '@/store/chatStore';
import styles from './chat.module.css';

export default function EmptyResultsState() {
  const { setCurrentResultProperties } = useChatStore();

  const handleShowAll = async () => {
    try {
      const res = await fetch('/api/properties?limit=20');
      const data = await res.json();
      const propsArray = data.properties || data.data || data;
      if (Array.isArray(propsArray)) {
        setCurrentResultProperties(propsArray);
      }
    } catch (e) {
      console.error("Fetch properties error", e);
    }
  };

  return (
    <div className={styles.emptyState}>
      <svg className={styles.emptyIcon} xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"></path>
        <path d="M14 22V12a2 2 0 0 0-2-2h-0a2 2 0 0 0-2 2v10"></path>
        <path d="M8 10h.01"></path>
        <path d="M16 10h.01"></path>
        <path d="M8 14h.01"></path>
        <path d="M16 14h.01"></path>
        <path d="M8 18h.01"></path>
        <path d="M16 18h.01"></path>
      </svg>
      <div className={styles.emptyTitle}>Your results will appear here</div>
      <div className={styles.emptySubtitle}>Start a conversation to discover spaces</div>
      <button className={styles.showAllBtn} onClick={handleShowAll}>
        Show all properties
      </button>
    </div>
  );
}
