import type { MutationResolvers } from "../../generated/graphql/types";
import { db } from "../../lib/db";
import { generateChatResponse } from "../../lib/deepseek";
import { MessageContentsSchema } from "../../shared";
import { getShogiCandidateMovesTool } from "../../services/getShogiCandidateMovesTool";
import { makeMoveTool } from "../../services/makeMoveTool";

export const sendChatMessage: MutationResolvers["sendChatMessage"] = async (
  _parent,
  { input }
) => {
  const { matchId, content } = input;

  // ユーザーメッセージを作成
  const userMessage = await db.chatMessage.create({
    data: {
      matchId,
      role: "USER",
      contents: [{ type: "markdown", content }],
      isPartial: false,
    },
  });

  // 仮のAI応答メッセージを作成（isPartial: true）
  const assistantMessage = await db.chatMessage.create({
    data: {
      matchId,
      role: "ASSISTANT",
      contents: [{ type: "markdown", content: "考え中..." }],
      isPartial: true,
    },
  });

  // 非同期でAI応答を生成・更新
  generateAndUpdateAiResponse({
    matchId,
    content,
    userMessageId: userMessage.id,
    assistantMessageId: assistantMessage.id,
  });

  // 即座にレスポンスを返す
  return {
    userMessage: {
      id: userMessage.id,
      matchId: userMessage.matchId,
      role: userMessage.role,
      contents: MessageContentsSchema.parse(userMessage.contents),
      isPartial: userMessage.isPartial,
      createdAt: userMessage.createdAt.toISOString(),
    },
    assistantMessage: {
      id: assistantMessage.id,
      matchId: assistantMessage.matchId,
      role: assistantMessage.role,
      contents: MessageContentsSchema.parse(assistantMessage.contents),
      isPartial: assistantMessage.isPartial,
      createdAt: assistantMessage.createdAt.toISOString(),
    },
  };
};

/**
 * AI応答を生成してアシスタントメッセージを更新
 */
async function generateAndUpdateAiResponse(params: {
  matchId: string;
  content: string;
  userMessageId: string;
  assistantMessageId: string;
}): Promise<void> {
  try {
    const { matchId, content, userMessageId, assistantMessageId } = params;

    // 会話履歴を取得（最新5件、partial除外）
    const history = await db.chatMessage.findMany({
      where: { matchId, isPartial: false },
      orderBy: { createdAt: "asc" },
      take: 5,
    });

    // DeepSeek APIで応答を生成
    const conversationHistory = history
      .filter((msg) => msg.id !== userMessageId)
      .map((msg) => {
        const contents = msg.contents as Array<{
          type: string;
          content: string;
        }>;
        const textContent = contents
          .filter((c) => c.type === "markdown")
          .map((c) => c.content)
          .join("\n");
        return {
          role: msg.role.toLowerCase() as "user" | "assistant",
          content: textContent,
        };
      });

    // ツールマップを作成
    const tools = [getShogiCandidateMovesTool, makeMoveTool];
    const toolMap = new Map(
      tools.map((tool) => [tool.definition.function.name, tool])
    );

    // Function Callingを有効にしてAI応答を生成
    const aiResponseContent = await generateChatResponse({
      userMessage: `対局ID: ${matchId}\n${content}`,
      conversationHistory,
      tools: tools.map((t) => t.definition),
      onToolCall: async (toolName, toolArgs) => {
        const tool = toolMap.get(toolName);
        if (!tool) {
          throw new Error(`Unknown tool: ${toolName}`);
        }
        // Zodでバリデーション
        const validatedArgs = tool.argsSchema.parse(toolArgs);
        // ツールを実行
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await tool.execute(validatedArgs as any);
      },
    });

    // AI応答メッセージを更新
    await db.chatMessage.update({
      where: { id: assistantMessageId },
      data: {
        contents: [{ type: "markdown", content: aiResponseContent }],
        isPartial: false,
      },
    });
  } catch (error) {
    console.error("DeepSeek API error:", error);
    // エラー時も更新
    await db.chatMessage.update({
      where: { id: params.assistantMessageId },
      data: {
        contents: [
          {
            type: "markdown",
            content:
              "申し訳ございません。AIの応答生成中にエラーが発生しました。",
          },
        ],
        isPartial: false,
      },
    });
  }
}
