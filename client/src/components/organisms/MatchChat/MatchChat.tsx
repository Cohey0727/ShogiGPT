import { useState } from "react";
import { MessageBubble } from "../MessageBubble";
import {
  useGetChatMessagesQuery,
  useCreateChatMessageMutation,
  MessageRole,
} from "../../../generated/graphql/types";
import styles from "./MatchChat.css";

interface MatchChatProps {
  matchId: string;
  currentUser?: string;
  onFirstMessage?: () => Promise<string | null>;
}

const formatTimestamp = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function MatchChat({
  matchId,
  currentUser = "あなた",
  onFirstMessage,
}: MatchChatProps) {
  const isNewMatch = matchId === "new";
  const [inputValue, setInputValue] = useState("");

  // メッセージ取得（新規対局の場合はスキップ）
  const [{ data, fetching }] = useGetChatMessagesQuery({
    variables: { matchId },
    pause: isNewMatch,
  });

  const [, createChatMessage] = useCreateChatMessageMutation();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    let targetMatchId = matchId;

    // 新規対局の最初のメッセージの場合、マッチを作成
    if (isNewMatch && onFirstMessage) {
      const newMatchId = await onFirstMessage();
      if (!newMatchId) {
        console.error("Failed to create match");
        return;
      }
      targetMatchId = newMatchId;
    }

    // メッセージを作成
    await createChatMessage({
      input: {
        matchId: targetMatchId,
        role: MessageRole.User,
        content: inputValue,
      },
    });

    setInputValue("");
  };

  const messages = data?.getChatMessages || [];

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
      <div className={styles.messagesContainer}>
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            sender={msg.role === MessageRole.User ? "あなた" : "アシスタント"}
            message={msg.content}
            timestamp={formatTimestamp(msg.createdAt)}
            isCurrentUser={msg.role === MessageRole.User}
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
