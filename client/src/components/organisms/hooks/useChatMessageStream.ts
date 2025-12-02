import { useRef } from "react";

import {
  SubscribeChatMessagesStreamSubscription,
  useSubscribeChatMessagesStreamSubscription,
} from "../../../generated/graphql/types";
import { useReduceMemo } from "../../molecules/hooks";
import { uniqBy } from "../../../shared/utils";

/** Streaming開始の基準時刻（全データ取得用） */
const initialCursor = "1970-01-01T00:00:00.000Z";

type ChatMessage = SubscribeChatMessagesStreamSubscription["chatMessagesStream"][number];

/**
 * ChatMessageをStreaming Subscriptionで取得するhook
 */
export const useChatMessageStream = ({ matchId }: { matchId: string }) => {
  const cursorRef = useRef<string>(initialCursor);

  const [result, ...rest] = useSubscribeChatMessagesStreamSubscription({
    // eslint-disable-next-line react-hooks/refs
    variables: { matchId, cursor: cursorRef.current },
  });

  const messages = useReduceMemo<ChatMessage[]>(
    (prev = []) => {
      const newMessages = result.data?.chatMessagesStream ?? [];
      const totalMessages = uniqBy([...newMessages, ...prev], "id").sort(
        (a, b) => -b.createdAt.localeCompare(a.createdAt),
      );
      if (totalMessages.length > 0) {
        const latestMessage = totalMessages.at(-1)!;
        cursorRef.current = latestMessage.updatedAt;
      }
      return totalMessages;
    },
    [result.data?.chatMessagesStream],
  );

  return [messages, ...rest] as const;
};
