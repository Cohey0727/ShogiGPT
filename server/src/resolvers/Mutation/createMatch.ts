import type { MutationResolvers } from "../../generated/graphql/types";
import { db } from "../../lib/db";

/**
 * 対局を作成する
 */
export const createMatch: MutationResolvers["createMatch"] = async (
  _parent,
  { input }
) => {
  const { id, playerSente, playerGote } = input;

  // 対局を作成
  const match = await db.match.create({
    data: {
      ...(id && { id }),
      playerSente: playerSente ?? null,
      playerGote: playerGote ?? null,
    },
  });

  return {
    id: match.id,
    createdAt: match.createdAt.toISOString(),
    updatedAt: match.updatedAt.toISOString(),
    status: match.status,
    playerSente: match.playerSente,
    playerGote: match.playerGote,
  };
};
