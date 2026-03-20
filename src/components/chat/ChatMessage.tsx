'use client';
import { Message, useChatStore } from '@/store/chatStore';
import styles from './chat.module.css';
import MobilePropertyStrip from './MobilePropertyStrip';

export default function ChatMessage({ message, isMobile }: { message: Message; isMobile?: boolean }) {
  const { isStreaming } = useChatStore();
  const isUser = message.role === 'user';

  if (isUser) {
    return <div className={styles.msgUser}>{message.content}</div>;
  }

  return (
    <div className={styles.msgAi}>
      <div className={styles.aiBubble}>
        {message.content ? message.content : (
          isStreaming && message.content === '' && (
            <div className={styles.typingIndicator}>
              <span /><span /><span />
            </div>
          )
        )}
        {isStreaming && message.content !== '' && (
          <div className={styles.typingIndicator} style={{marginTop: '8px'}}>
            <span /><span /><span />
          </div>
        )}
      </div>

      {isMobile && message.propertyIds && message.propertyIds.length > 0 && (
        <MobilePropertyStrip propertyIds={message.propertyIds} />
      )}
    </div>
  );
}
