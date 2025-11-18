import { useState, useRef, useEffect, useMemo } from "react";
import { MessageBubble } from "../MessageBubble";
import { Button } from "../../atoms/Button";
import {
  useSubscribeChatMessagesSubscription,
  useSendChatMessageMutation,
} from "../../../generated/graphql/types";
import styles from "./MatchChat.css";

interface MatchChatProps {
  matchId: string;
  currentUser?: string;
}

const formatTimestamp = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function MatchChat({ matchId }: MatchChatProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // メッセージ取得 - Subscriptionでリアルタイム更新
  const [{ data, fetching }] = useSubscribeChatMessagesSubscription({
    variables: { matchId },
  });

  const [, sendChatMessage] = useSendChatMessageMutation();

  const messages = useMemo(() => data?.chatMessages || [], [data?.chatMessages]);

  // 新着メッセージがある場合は自動スクロール
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // メッセージを送信（サーバーがユーザーメッセージとAI応答の両方を作成）
    await sendChatMessage({
      matchId,
      content: inputValue,
    });

    setInputValue("");
  };

  if (fetching) {
    return (
      <div className={styles.container}>
        <div className={styles.messagesContainer}>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.messagesContainer} ref={messagesContainerRef}>
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            sender={msg.role === "USER" ? "あなた" : "アシスタント"}
            message={msg.content}
            timestamp={formatTimestamp(msg.createdAt)}
            isCurrentUser={msg.role === "USER"}
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
        <Button type="submit">
          送信
        </Button>
      </form>
    </div>
  );
}
