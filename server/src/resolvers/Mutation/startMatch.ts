import type { MutationResolvers } from "../../generated/graphql/types";
import { db } from "../../lib/db";
import { generateChatResponse } from "../../lib/deepseek";

/**
 * 対局を作成する
 */
export const startMatch: MutationResolvers["startMatch"] = async (
  _parent,
  { input }
) => {
  const { id, playerSente, playerGote, senteType, goteType } = input;

  // 対局を作成
  const match = await db.match.create({
    data: {
      ...(id && { id }),
      playerSente: playerSente ?? null,
      playerGote: playerGote ?? null,
      senteType: senteType,
      goteType: goteType,
    },
  });

  // 非同期でAIの挨拶メッセージを生成
  generateGreetingMessage({
    matchId: match.id,
    playerSente: match.playerSente,
    playerGote: match.playerGote,
    senteType: senteType ?? "HUMAN",
    goteType: goteType ?? "HUMAN",
  });

  return {
    id: match.id,
    createdAt: match.createdAt.toISOString(),
    updatedAt: match.updatedAt.toISOString(),
    status: match.status,
    playerSente: match.playerSente,
    playerGote: match.playerGote,
    senteType: match.senteType,
    goteType: match.goteType,
  };
};

/**
 * 対局開始時のAI挨拶メッセージを生成
 */
async function generateGreetingMessage(params: {
  matchId: string;
  playerSente: string | null;
  playerGote: string | null;
  senteType: "AI" | "HUMAN";
  goteType: "AI" | "HUMAN";
}): Promise<void> {
  try {
    const { matchId, playerSente, playerGote, senteType, goteType } = params;

    // プレイヤー情報を構築
    const senteInfo =
      senteType === "AI" ? "AI" : playerSente ? `${playerSente}さん` : "先手";
    const goteInfo =
      goteType === "AI" ? "AI" : playerGote ? `${playerGote}さん` : "後手";

    // AIに挨拶メッセージを生成させる
    const greetingPrompt = `対局が始まりました。先手は${senteInfo}、後手は${goteInfo}です。対局開始の挨拶をしてください。簡潔に2〜3文で。最初の手の話とかするな。挨拶だけしろ。`;

    const greetingContent = await generateChatResponse(greetingPrompt);

    // 挨拶メッセージをデータベースに保存
    await db.chatMessage.create({
      data: {
        matchId,
        role: "ASSISTANT",
        contents: [{ type: "markdown", content: greetingContent }],
        isPartial: false,
      },
    });
  } catch (error) {
    console.error("Failed to generate greeting message:", error);
    // エラーでも対局は続行（挨拶メッセージなしでOK）
  }
}
