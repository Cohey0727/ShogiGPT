import type { MutationResolvers } from "../../generated/graphql/types";
import { db } from "../../lib/db";
import { PlayerType } from "../../generated/prisma/client";

/**
 * 対局を作成する
 */
export const createMatch: MutationResolvers["createMatch"] = async (
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
      senteType:
        senteType === "AI" ? PlayerType.AI : PlayerType.HUMAN,
      goteType:
        goteType === "AI" ? PlayerType.AI : PlayerType.HUMAN,
    },
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
