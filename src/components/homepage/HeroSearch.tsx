'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './HeroSearch.module.css';

const SUGGESTIONS = [
  'Furnished office under ₹50K/month',
  'Warehouse with loading bay, 3000+ sq ft',
  'Coworking space near Sector 62',
  'Retail space for sale under ₹1 Cr',
];

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/chat?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchContainer}>
        <svg
          className={styles.searchIcon}
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          className={styles.input}
          placeholder="Ask anything... e.g. furnished office under ₹50,000/month in Sector 62"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit(query)}
        />
        <button
          className={`${styles.sendButton} ${query.trim() ? styles.visible : ''}`}
          onClick={() => handleSubmit(query)}
          aria-label="Send"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>

      <div className={styles.promptChips}>
        {SUGGESTIONS.map((chipText) => (
          <button
            key={chipText}
            className={styles.chip}
            onClick={() => handleSubmit(chipText)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
            {chipText}
          </button>
        ))}
      </div>
    </div>
  );
}
