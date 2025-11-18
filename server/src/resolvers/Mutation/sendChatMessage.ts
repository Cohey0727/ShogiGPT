import type { MutationResolvers } from "../../generated/graphql/types";
import { db } from "../../lib/db";
import { generateChatResponse } from "../../lib/deepseek";

export const sendChatMessage: MutationResolvers["sendChatMessage"] = async (
  _parent,
  { input }
) => {
  const { matchId, content } = input;

  // ユーザーメッセージを作成
  const userMessage = await db.chatMessage.create({
    data: {
      matchId,
      role: "USER",
      contents: [{ type: "markdown", content }],
      isPartial: false,
    },
  });

  // 仮のAI応答メッセージを作成（isPartial: true）
  const assistantMessage = await db.chatMessage.create({
    data: {
      matchId,
      role: "ASSISTANT",
      contents: [{ type: "markdown", content: "考え中..." }],
      isPartial: true,
    },
  });

  // 非同期でAI応答を生成・更新
  (async () => {
    try {
      // 会話履歴を取得（最新10件、partial除外）
      const history = await db.chatMessage.findMany({
        where: {
          matchId,
          isPartial: false,
        },
        orderBy: { createdAt: "asc" },
        take: 10,
      });

      // DeepSeek APIで応答を生成
      const conversationHistory = history
        .filter((msg) => msg.id !== userMessage.id)
        .map((msg) => {
          const contents = msg.contents as Array<{
            type: string;
            content: string;
          }>;
          const textContent = contents
            .filter((c) => c.type === "markdown")
            .map((c) => c.content)
            .join("\n");
          return {
            role: msg.role.toLowerCase() as "user" | "assistant",
            content: textContent,
          };
        });

      const aiResponseContent = await generateChatResponse(
        content,
        conversationHistory
      );

      // AI応答メッセージを更新
      await db.chatMessage.update({
        where: { id: assistantMessage.id },
        data: {
          contents: [{ type: "markdown", content: aiResponseContent }],
          isPartial: false,
        },
      });
    } catch (error) {
      console.error("DeepSeek API error:", error);
      // エラー時も更新
      await db.chatMessage.update({
        where: { id: assistantMessage.id },
        data: {
          contents: [
            {
              type: "markdown",
              content:
                "申し訳ございません。AIの応答生成中にエラーが発生しました。",
            },
          ],
          isPartial: false,
        },
      });
    }
  })();

  // 即座にレスポンスを返す
  return {
    userMessage: {
      id: userMessage.id,
      matchId: userMessage.matchId,
      role: userMessage.role,
      contents: userMessage.contents as unknown as Array<
        | { __typename?: "MarkdownContent"; type: string; content: string }
        | {
            __typename?: "BestMoveContent";
            type: string;
            bestmove: string;
            variations: Array<{
              move: string;
              scoreCp?: number | null;
              scoreMate?: number | null;
              depth: number;
              nodes?: number | null;
              pv?: string[] | null;
            }>;
            timeMs: number;
            engineName: string;
          }
      >,
      isPartial: userMessage.isPartial,
      createdAt: userMessage.createdAt.toISOString(),
    },
    assistantMessage: {
      id: assistantMessage.id,
      matchId: assistantMessage.matchId,
      role: assistantMessage.role,
      contents: assistantMessage.contents as unknown as Array<
        | { __typename?: "MarkdownContent"; type: string; content: string }
        | {
            __typename?: "BestMoveContent";
            type: string;
            bestmove: string;
            variations: Array<{
              move: string;
              scoreCp?: number | null;
              scoreMate?: number | null;
              depth: number;
              nodes?: number | null;
              pv?: string[] | null;
            }>;
            timeMs: number;
            engineName: string;
          }
      >,
      isPartial: assistantMessage.isPartial,
      createdAt: assistantMessage.createdAt.toISOString(),
    },
  };
};
