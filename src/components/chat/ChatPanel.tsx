'use client';
import { useChatStore } from '@/store/chatStore';
import { useEffect, useRef } from 'react';
import styles from './chat.module.css';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export default function ChatPanel() {
  const { messages } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      <div className={styles.messagesArea}>
        {messages.map((msg, i) => (
          <ChatMessage key={msg.id || i} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className={styles.desktopInputContainer} style={{ padding: '0 16px 16px' }}>
        <ChatInput />
      </div>
    </>
  );
}
