import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./MessageBubble.css";

export interface MessageBubbleProps {
  sender: string;
  message: string;
  timestamp: string;
  isCurrentUser?: boolean;
}

export function MessageBubble({
  sender,
  message,
  timestamp,
  isCurrentUser = false,
}: MessageBubbleProps) {
  return (
    <div className={isCurrentUser ? styles.messageOwn : styles.messageOther}>
      <div className={styles.messageSender}>{sender}</div>
      <div className={styles.messageContent}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message}</ReactMarkdown>
      </div>
      <div className={styles.messageTime}>{timestamp}</div>
    </div>
  );
}
