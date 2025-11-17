import type { MutationResolvers } from "../../generated/graphql/types";
import { db } from "../../lib/db";

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
      content,
    },
  });

  // TODO: ここでDEEPL APIを呼び出して翻訳や、
  // AI応答を生成する処理を追加

  // 仮のAI応答を作成（後でDEEPL/AI連携に置き換え）
  const assistantMessage = await db.chatMessage.create({
    data: {
      matchId,
      role: "ASSISTANT",
      content: `受信しました: ${content}`,
    },
  });

  return {
    userMessage: {
      id: userMessage.id,
      matchId: userMessage.matchId,
      role: userMessage.role,
      content: userMessage.content,
      createdAt: userMessage.createdAt.toISOString(),
    },
    assistantMessage: {
      id: assistantMessage.id,
      matchId: assistantMessage.matchId,
      role: assistantMessage.role,
      content: assistantMessage.content,
      createdAt: assistantMessage.createdAt.toISOString(),
    },
  };
};
