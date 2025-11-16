import type {
  MatchStatus,
  MutationResolvers,
} from "../../generated/graphql/types";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

/**
 * 対局を作成する
 */
export const createMatch: MutationResolvers["createMatch"] = async (
  _,
  { input }
) => {
  const match = await prisma.match.create({
    data: {
      status: "ONGOING",
      playerSente: input.playerSente ?? null,
      playerGote: input.playerGote ?? null,
    },
  });

  return {
    id: match.id,
    createdAt: match.createdAt.toISOString(),
    updatedAt: match.updatedAt.toISOString(),
    status: match.status as MatchStatus,
    playerSente: match.playerSente,
    playerGote: match.playerGote,
    states: [],
    messages: [],
  };
};
