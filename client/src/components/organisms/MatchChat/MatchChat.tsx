import { useState } from "react";
import { MessageBubble } from "../MessageBubble";
import styles from "./MatchChat.css";

export interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  isCurrentUser?: boolean;
}

interface MatchChatProps {
  matchId: string;
  currentUser?: string;
}

export function MatchChat({ currentUser = "あなた" }: MatchChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "田中太郎",
      message: "よろしくお願いします！",
      timestamp: "14:30",
      isCurrentUser: false,
    },
    {
      id: "2",
      sender: "佐藤花子",
      message: "よろしくお願いします。頑張りましょう！",
      timestamp: "14:31",
      isCurrentUser: false,
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: currentUser,
      message: inputValue,
      timestamp: new Date().toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isCurrentUser: true,
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.messagesContainer}>
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            sender={msg.sender}
            message={msg.message}
            timestamp={msg.timestamp}
            isCurrentUser={msg.isCurrentUser}
          />
        ))}
      </div>
      <form className={styles.inputContainer} onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="メッセージを入力..."
          className={styles.input}
        />
        <button type="submit" className={styles.sendButton}>
          送信
        </button>
      </form>
    </div>
  );
}
