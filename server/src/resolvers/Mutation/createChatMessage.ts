import type {
  MessageRole,
  MutationResolvers,
} from "../../generated/graph/types";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

/**
 * チャットメッセージを作成する
 */
export const createChatMessage: MutationResolvers["createChatMessage"] =
  async (_, { input }) => {
    const message = await prisma.chatMessage.create({
      data: {
        matchId: input.matchId,
        role: input.role,
        content: input.content,
        metadata: input.metadata ?? null,
      },
    });

    return {
      id: message.id,
      createdAt: message.createdAt.toISOString(),
      matchId: message.matchId,
      role: message.role as MessageRole,
      content: message.content,
      metadata: message.metadata,
    };
  };
