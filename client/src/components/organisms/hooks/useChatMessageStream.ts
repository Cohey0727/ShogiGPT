import { useRef } from "react";

import {
  GetChatMessagesQuery,
  useGetChatMessagesQuery,
  useSubscribeChatMessagesStreamSubscription,
} from "../../../generated/graphql/types";
import { useReduceMemo } from "../../molecules/hooks";
import { uniqBy } from "../../../shared/utils";

type ChatMessage = GetChatMessagesQuery["chatMessages"][number];

const initialCursor = "1970-01-01T00:00:00.000Z";

/**
 * ChatMessageを初回fetchしてからStreaming Subscriptionで取得するhook
 */
export const useChatMessageStream = ({ matchId }: { matchId: string }) => {
  const cursorRef = useRef<string>(initialCursor);

  // 初回fetch
  const [queryResult] = useGetChatMessagesQuery({ variables: { matchId } });

  const [streamResult, ...rest] = useSubscribeChatMessagesStreamSubscription({
    // eslint-disable-next-line react-hooks/refs
    variables: { matchId, cursor: cursorRef.current },
  });

  // 初回fetchとストリームのメッセージをマージ
  const messages = useReduceMemo<ChatMessage[]>(
    (prev = []) => {
      const initialMessages = queryResult.data?.chatMessages ?? [];
      const streamMessages = streamResult.data?.chatMessagesStream ?? [];

      // 初回fetch分とstream分をマージして重複排除
      const totalMessages = uniqBy([...initialMessages, ...streamMessages, ...prev], "id").sort(
        (a, b) => a.createdAt.localeCompare(b.createdAt),
      );
      if (totalMessages.length > 0) {
        const latestMessage = totalMessages.at(-1)!;
        cursorRef.current = latestMessage.updatedAt;
      }
      return totalMessages;
    },
    [queryResult.data?.chatMessages, streamResult.data?.chatMessagesStream],
  );

  return [messages, ...rest] as const;
};
