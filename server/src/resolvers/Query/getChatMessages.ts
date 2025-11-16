import type {
  MessageRole,
  QueryResolvers,
} from "../../generated/graphql/types";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

/**
 * 指定した対局のチャットメッセージを取得
 */
export const getChatMessages: QueryResolvers["getChatMessages"] = async (
  _,
  { matchId }
) => {
  const messages = await prisma.chatMessage.findMany({
    where: {
      matchId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return messages.map((message) => ({
    id: message.id,
    createdAt: message.createdAt.toISOString(),
    matchId: message.matchId,
    role: message.role as MessageRole,
    content: message.content,
    metadata: message.metadata,
  }));
};
