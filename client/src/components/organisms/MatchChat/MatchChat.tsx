import { useState, useRef, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageBubble } from "../MessageBubble";
import { Button } from "../../atoms/Button";
import { BestMoveDisplay } from "../../molecules/BestMoveDisplay";
import {
  useSubscribeChatMessagesSubscription,
  useSendChatMessageMutation,
} from "../../../generated/graphql/types";
import {
  MarkdownContentSchema,
  BestMoveContentSchema,
} from "../../../schemas/chatMessage";
import styles from "./MatchChat.css";

interface MatchChatProps {
  matchId: string;
  currentUser?: string;
  disabled?: boolean;
}

const formatTimestamp = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function MatchChat({ matchId, disabled = false }: MatchChatProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // メッセージ取得 - Subscriptionでリアルタイム更新
  const [{ data }] = useSubscribeChatMessagesSubscription({
    variables: { matchId },
  });

  const [, sendChatMessage] = useSendChatMessageMutation();

  const messages = useMemo(
    () => data?.chatMessages || [],
    [data?.chatMessages]
  );

  // 新着メッセージがある場合は自動スクロール
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    // メッセージを送信（サーバーがユーザーメッセージとAI応答の両方を作成）
    await sendChatMessage({
      matchId,
      content: inputValue,
    });
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setInputValue(textarea.value);

    // 高さを自動調整
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${newHeight}px`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.messagesContainer} ref={messagesContainerRef}>
        {messages.map((msg) => {
          const sender = msg.role === "USER" ? "あなた" : "ShogiGPT";
          const isCurrentUser = msg.role === "USER";
          const timestamp = formatTimestamp(msg.createdAt);

          // contents を1つの MessageBubble にレンダリング
          return (
            <MessageBubble
              key={msg.id}
              sender={sender}
              timestamp={timestamp}
              isCurrentUser={isCurrentUser}
              isPartial={msg.isPartial}
            >
              {msg.contents?.map((content: unknown, idx: number) => {
                if (!content || typeof content !== "object") {
                  return null;
                }

                // Markdown コンテンツ
                const markdownResult = MarkdownContentSchema.safeParse(content);
                if (markdownResult.success) {
                  return (
                    <div key={`${msg.id}-${idx}`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {markdownResult.data.content}
                      </ReactMarkdown>
                    </div>
                  );
                }

                // BestMove コンテンツ
                const bestMoveResult = BestMoveContentSchema.safeParse(content);
                if (bestMoveResult.success) {
                  return (
                    <div key={`${msg.id}-${idx}`}>
                      <BestMoveDisplay content={bestMoveResult.data} />
                    </div>
                  );
                }

                return null;
              })}
            </MessageBubble>
          );
        })}
      </div>
      <form className={styles.inputContainer} onSubmit={handleSendMessage}>
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力... (⌘+Enter or Ctrl+Enterで送信)"
          className={styles.textarea}
          disabled={disabled}
          maxLength={1000}
          rows={1}
        />
        <Button type="submit" disabled={disabled}>
          送信
        </Button>
      </form>
    </div>
  );
}
