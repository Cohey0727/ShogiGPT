import type { MutationResolvers } from "../../generated/graphql/types";
import { db } from "../../lib/db";

/**
 * 対局を分岐して新しい対局を作成する
 * 元の対局から指定したインデックスまでのMatchStateをコピーした新しい対局を作成する
 */
export const forkMatch: MutationResolvers["forkMatch"] = async (_parent, { input }) => {
  const { matchId, fromIndex } = input;

  // 元の対局を取得
  const originalMatch = await db.match.findUnique({
    where: { id: matchId },
    include: {
      states: {
        where: { index: { lte: fromIndex } },
        orderBy: { index: "asc" },
      },
    },
  });

  if (!originalMatch) {
    throw new Error(`Match not found: ${matchId}`);
  }

  if (originalMatch.states.length === 0) {
    throw new Error(`No states found up to index ${fromIndex}`);
  }

  // 新しい対局を作成
  const newMatch = await db.match.create({
    data: {
      playerSente: originalMatch.playerSente,
      playerGote: originalMatch.playerGote,
      senteType: originalMatch.senteType,
      goteType: originalMatch.goteType,
      // MatchStateをコピー
      states: {
        createMany: {
          data: originalMatch.states.map((state) => ({
            index: state.index,
            sfen: state.sfen,
            usiMove: state.usiMove,
            thinkingTime: state.thinkingTime,
          })),
        },
      },
    },
  });

  // 挨拶メッセージを追加
  await db.chatMessage.create({
    data: {
      matchId: newMatch.id,
      role: "ASSISTANT",
      contents: [
        {
          type: "markdown",
          content: `${fromIndex}手目から分岐した新しい対局です。よろしくお願いします。`,
        },
      ],
      isPartial: false,
    },
  });

  return {
    id: newMatch.id,
    createdAt: newMatch.createdAt.toISOString(),
    updatedAt: newMatch.updatedAt.toISOString(),
    status: newMatch.status,
    playerSente: newMatch.playerSente,
    playerGote: newMatch.playerGote,
    senteType: newMatch.senteType,
    goteType: newMatch.goteType,
  };
};
