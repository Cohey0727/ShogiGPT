import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./MessageBubble.css";
import type { ReactNode } from "react";

export interface MessageBubbleProps {
  sender: string;
  message?: string;
  children?: ReactNode;
  timestamp: string;
  isCurrentUser?: boolean;
  isPartial?: boolean;
}

function LoadingDots() {
  return (
    <div className={styles.loadingDots}>
      <span className={`${styles.dot} ${styles.dot1}`} />
      <span className={`${styles.dot} ${styles.dot2}`} />
      <span className={`${styles.dot} ${styles.dot3}`} />
    </div>
  );
}

export function MessageBubble({
  sender,
  message,
  children,
  timestamp,
  isCurrentUser = false,
  isPartial = false,
}: MessageBubbleProps) {
  return (
    <div className={isCurrentUser ? styles.messageOwn : styles.messageOther}>
      <div className={styles.messageSender}>{sender}</div>
      <div className={styles.messageContent}>
        {message ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message}</ReactMarkdown>
        ) : (
          children
        )}
        {isPartial && <LoadingDots />}
      </div>
      <div className={styles.messageTime}>{timestamp}</div>
    </div>
  );
}
