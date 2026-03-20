'use client';
import { useChatStore } from '@/store/chatStore';
import styles from './chat.module.css';
import ResultsPanelHeader from './ResultsPanelHeader';
import PropertyResultCard from './PropertyResultCard';
import EmptyResultsState from './EmptyResultsState';

export default function ResultsPanel() {
  const { currentResultProperties, messages } = useChatStore();

  return (
    <>
      <ResultsPanelHeader />
      {messages.length === 0 && currentResultProperties.length === 0 ? (
        <EmptyResultsState />
      ) : (
        <div className={styles.resultsGrid}>
          {currentResultProperties.map(p => (
            <PropertyResultCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </>
  );
}
