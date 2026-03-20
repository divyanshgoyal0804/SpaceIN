'use client';

import { useChatStore } from '@/store/chatStore';
import styles from './chat.module.css';

export default function ResultsPanelHeader() {
  const { messages, currentResultProperties, isStreaming } = useChatStore();

  const isEmpty = messages.length === 0;

  return (
    <div className={styles.resultsHeader}>
      {isStreaming && <div className={styles.loadingBar}></div>}

      {isEmpty ? (
        <div className={styles.resultsHeaderEmpty}>
          <div className={styles.headerTitle}>
            🏢 Browse all available spaces
          </div>
          <div className={styles.headerSubtitle}>
            Type a query on the left to find specific properties
          </div>
        </div>
      ) : (
        <>
          <div className={`${styles.headerTitle} ${styles.loadedIndicator}`}>
            ✦ Showing results for your latest request
          </div>
          <div className={styles.headerSubtitle}>
            {currentResultProperties.length} properties found
          </div>
        </>
      )}
    </div>
  );
}
