'use client';
import { Message, useChatStore } from '@/store/chatStore';
import styles from './chat.module.css';
import MobilePropertyStrip from './MobilePropertyStrip';
import ReactMarkdown from 'react-markdown';

/**
 * ChatMessage component with proper markdown rendering.
 * AI responses are rendered as rich markdown (bold, lists, tables, rules).
 * User messages remain plain text.
 */
export default function ChatMessage({ message, isMobile }: { message: Message; isMobile?: boolean }) {
  const { isStreaming } = useChatStore();
  const isUser = message.role === 'user';

  if (isUser) {
    return <div className={styles.msgUser}>{message.content}</div>;
  }

  return (
    <div className={styles.msgAi}>
      <div className={styles.aiBubble}>
        {message.content ? (
          <div className={styles.markdownContent}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ) : (
          isStreaming && message.content === '' && (
            <div className={styles.typingIndicator}>
              <span /><span /><span />
            </div>
          )
        )}
        {isStreaming && message.content !== '' && (
          <span className={styles.streamCursor}>▊</span>
        )}
      </div>

      {isMobile && message.propertyIds && message.propertyIds.length > 0 && (
        <MobilePropertyStrip propertyIds={message.propertyIds} />
      )}
    </div>
  );
}
