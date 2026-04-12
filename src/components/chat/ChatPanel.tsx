'use client';
import { useChatStore } from '@/store/chatStore';
import { useEffect, useRef } from 'react';
import styles from './chat.module.css';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export default function ChatPanel() {
  const { messages } = useChatStore();
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <>
      <div ref={messagesRef} className={styles.messagesArea}>
        {messages.map((msg, i) => (
          <ChatMessage key={msg.id || i} message={msg} />
        ))}
      </div>

      <div className={styles.desktopInputContainer} style={{ padding: '0 16px 16px' }}>
        <ChatInput />
      </div>
    </>
  );
}
