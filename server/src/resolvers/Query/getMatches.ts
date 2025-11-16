import type {
  MatchStatus,
  MessageRole,
  Player,
  QueryResolvers,
} from "../../generated/graph/types";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

/**
 * 全対局を取得（ネストされた局面とメッセージを含む）
 */
export const getMatches: QueryResolvers["getMatches"] = async () => {
  const matches = await prisma.match.findMany({
    include: {
      states: {
        orderBy: { index: "asc" },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return matches.map((match) => ({
    id: match.id,
    createdAt: match.createdAt.toISOString(),
    updatedAt: match.updatedAt.toISOString(),
    status: match.status as MatchStatus,
    playerSente: match.playerSente,
    playerGote: match.playerGote,
    states: match.states.map((state) => ({
      id: state.id,
      createdAt: state.createdAt.toISOString(),
      matchId: state.matchId,
      index: state.index,
      moveNotation: state.moveNotation,
      player: state.player as Player,
      sfen: state.sfen,
      thinkingTime: state.thinkingTime,
    })),
    messages: match.messages.map((message) => ({
      id: message.id,
      createdAt: message.createdAt.toISOString(),
      matchId: message.matchId,
      role: message.role as MessageRole,
      content: message.content,
      metadata: message.metadata,
    })),
  }));
};
