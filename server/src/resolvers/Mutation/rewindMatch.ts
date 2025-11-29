import type { MutationResolvers } from "../../generated/graphql/types";
import { db } from "../../lib/db";

/**
 * 対局を指定した手数まで巻き戻す
 * 指定したインデックスより後のMatchStateとChatMessageを削除する
 */
export const rewindMatch: MutationResolvers["rewindMatch"] = async (_parent, { input }) => {
  const { matchId, toIndex } = input;

  // 対局が存在するか確認
  const match = await db.match.findUnique({
    where: { id: matchId },
  });

  if (!match) {
    throw new Error(`Match not found: ${matchId}`);
  }

  // 指定されたインデックス以降のMatchStateを削除
  await db.matchState.deleteMany({
    where: {
      matchId,
      index: { gt: toIndex },
    },
  });

  // 対局のupdatedAtを更新
  const updatedMatch = await db.match.update({
    where: { id: matchId },
    data: { updatedAt: new Date() },
  });

  return {
    id: updatedMatch.id,
    createdAt: updatedMatch.createdAt.toISOString(),
    updatedAt: updatedMatch.updatedAt.toISOString(),
    status: updatedMatch.status,
    playerSente: updatedMatch.playerSente,
    playerGote: updatedMatch.playerGote,
    senteType: updatedMatch.senteType,
    goteType: updatedMatch.goteType,
  };
};
