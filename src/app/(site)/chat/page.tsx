'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, Suspense } from 'react';
import { useChatStore } from '@/store/chatStore';
import ChatLayout from '@/components/chat/ChatLayout';

function ChatContent() {
  const searchParams = useSearchParams();
  const { sendMessage, messages, initSessions } = useChatStore();
  const firedRef = useRef(false);

  useEffect(() => {
    // initialize local storage sessions
    initSessions();
  }, [initSessions]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && messages.length === 0 && !firedRef.current) {
      firedRef.current = true;
      sendMessage(decodeURIComponent(q));
    }
  }, [searchParams, messages.length, sendMessage]);

  return <ChatLayout />;
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
