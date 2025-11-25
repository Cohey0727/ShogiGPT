import type { MutationResolvers } from "../../generated/graphql/types";
import { db } from "../../lib/db";
import { generateChatResponse } from "../../lib/deepseek";
import { MessageContentsSchema } from "../../shared";
import { getCandidateMoves } from "../../services/getCandidateMoves";
import { makeMove } from "../../services/makeMove";
import { createAiToolDefinition } from "../../services/aiFunctionCallingTool";

export const sendChatMessage: MutationResolvers["sendChatMessage"] = async (_parent, { input }) => {
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
  assistantMessageId: string;
}): Promise<void> {
  try {
    const { matchId, content, assistantMessageId } = params;

    // 会話履歴を取得（最新3件、partial除外）
    const history = await db.chatMessage.findMany({
      where: { matchId, isPartial: false },
      orderBy: { createdAt: "asc" },
      take: 3,
    });

    // DeepSeek APIで応答を生成
    const conversationHistory = history.map((msg) => {
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
    const tools = [
      { tool: getCandidateMoves, needsResponse: true },
      { tool: makeMove, needsResponse: false },
    ];
    const toolMap = new Map(
      tools.map((entry) => [
        entry.tool.name,
        { tool: entry.tool, needsResponse: entry.needsResponse },
      ]),
    );

    let shouldReturnResponse = true;

    // Function Callingを有効にしてAI応答を生成
    const aiResponseContent = await generateChatResponse({
      userMessage: createChatContent(content, matchId),
      conversationHistory,
      tools: tools.map((entry) =>
        createAiToolDefinition(entry.tool.name, entry.tool.description, entry.tool.args),
      ),
      onToolCall: async (toolName, toolArgs) => {
        const toolEntry = toolMap.get(toolName);
        if (!toolEntry) {
          throw new Error(`Unknown tool: ${toolName}`);
        }
        const { tool, needsResponse } = toolEntry;

        // ツールがレスポンスを必要としない場合、即座にアシスタントメッセージを削除
        if (!needsResponse) {
          shouldReturnResponse = false;
          await db.chatMessage.delete({
            where: { id: assistantMessageId },
          });
        }

        // Zodでバリデーション
        const validatedArgs = tool.args.parse(toolArgs);
        // ツールを実行
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await tool.execute(validatedArgs as any);
      },
    });

    // レスポンスが必要な場合のみAI応答メッセージを更新
    if (shouldReturnResponse) {
      await db.chatMessage.update({
        where: { id: assistantMessageId },
        data: {
          contents: [{ type: "markdown", content: aiResponseContent }],
          isPartial: false,
        },
      });
    }
  } catch (error) {
    console.error("DeepSeek API error:", error);
    // エラー時も更新
    await db.chatMessage.update({
      where: { id: params.assistantMessageId },
      data: {
        contents: [
          {
            type: "markdown",
            content: "申し訳ございません。AIの応答生成中にエラーが発生しました。",
          },
        ],
        isPartial: false,
      },
    });
  }
}

function createChatContent(content: string, matchId: string): string {
  return `対局ID: ${matchId}

ユーザー: ${content}

応答の注意点：
- 評価値は「優勢」「互角」「劣勢」などの表現で説明してください
- 対局IDには直接言及しないでください`;
}
