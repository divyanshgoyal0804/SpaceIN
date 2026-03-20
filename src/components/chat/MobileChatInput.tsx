'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import styles from './chat.module.css';

interface Props {
  onOpenHistory?: () => void;
}

export default function MobileChatInput({ onOpenHistory }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isStreaming } = useChatStore();

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
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

  // iOS fixed input keyboard lift happens automatically, but we maintain the logic. 
  // Focus keeps the keyboard up, visual viewport helps standard.
  useEffect(() => {
    // optional adjustment if needed
    const handleResize = () => {
       // do nothing specifically as flex/fixed usually handles it
    };
    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.mobileChatInputWrapper}>
      <textarea
        ref={textareaRef}
        className={styles.mobileChatTextarea}
        placeholder="Type a message..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        disabled={isStreaming}
      />
      <button 
        className={styles.mobileSendButton}
        onClick={handleSend}
        disabled={isStreaming || !value.trim()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  );
}
