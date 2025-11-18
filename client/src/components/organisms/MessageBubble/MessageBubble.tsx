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
}

export function MessageBubble({
  sender,
  message,
  children,
  timestamp,
  isCurrentUser = false,
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
      </div>
      <div className={styles.messageTime}>{timestamp}</div>
    </div>
  );
}
