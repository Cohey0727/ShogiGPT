import type { MutationResolvers } from "../../generated/graphql/types";
import { db } from "../../lib/db";
import { generateChatResponse } from "../../lib/deepseek";

/**
 * 平手の初期盤面（SFEN形式）
 */
const defaultSfen =
  "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1";

/**
 * 対局を作成する
 */
export const startMatch: MutationResolvers["startMatch"] = async (
  _parent,
  { input }
) => {
  const { id, playerSente, playerGote, senteType, goteType, sfen } = input;

  // 初期盤面のSFEN（指定がない場合は平手の初期盤面）
  const initialSfen = sfen ?? defaultSfen;

  // 対局を作成
  const match = await db.match.create({
    data: {
      ...(id && { id }),
      playerSente: playerSente ?? null,
      playerGote: playerGote ?? null,
      senteType: senteType,
      goteType: goteType,
      // 初期局面（index=0）を作成
      states: {
        create: {
          index: 0,
          sfen: initialSfen,
          moveNotation: "0000", // USI標準のパス/無効手表記
          thinkingTime: null,
        },
      },
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
