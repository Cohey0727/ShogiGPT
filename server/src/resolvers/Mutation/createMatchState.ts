import type {
  MutationResolvers,
  Player,
} from "../../generated/graph/types";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

/**
 * 局面を作成する
 */
export const createMatchState: MutationResolvers["createMatchState"] = async (
  _,
  { input }
) => {
  const state = await prisma.matchState.create({
    data: {
      matchId: input.matchId,
      index: input.index,
      moveNotation: input.moveNotation ?? null,
      player: input.player,
      sfen: input.sfen,
      thinkingTime: input.thinkingTime ?? null,
    },
  });

  return {
    id: state.id,
    createdAt: state.createdAt.toISOString(),
    matchId: state.matchId,
    index: state.index,
    moveNotation: state.moveNotation,
    player: state.player as Player,
    sfen: state.sfen,
    thinkingTime: state.thinkingTime,
  };
};
