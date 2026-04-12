'use client';

import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import styles from './chat.module.css';

interface ChatInputProps {
  onOpenHistory?: () => void;
}

export default function ChatInput({ onOpenHistory }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isStreaming } = useChatStore();

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (trimmed && !isStreaming) {
      sendMessage(trimmed);
      setValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.chatInputWrapper}>
      {/* Mobile history button (only visible on small screens basically, controlled by media query or we can just render it and hide on desktop if requested, wait prompt says "On mobile, also render a small history icon button"). 
          Let's just show it via CSS display none on desktop or always since layout implies mobile. Actually, let's use a class to hide on desktop. */}
      {onOpenHistory && (
        <button 
          className={`${styles.historyBtn} md:hidden lg:hidden`} 
          onClick={onOpenHistory}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="12 8 12 12 14 14"></polyline>
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        </button>
      )}

      <textarea
        ref={textareaRef}
        className={styles.textarea}
        placeholder="Type a message..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        disabled={isStreaming}
      />
      <button 
        className={styles.sendBtn}
        onClick={handleSend}
        disabled={isStreaming || !value.trim()}
        style={{ opacity: value.trim() ? 1 : 0, pointerEvents: value.trim() ? 'auto' : 'none' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  );
}
