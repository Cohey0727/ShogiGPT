import type { AiPersonality, MutationResolvers } from "../../generated/graphql/types";
import { db } from "../../lib/db";
import { generateChatResponse } from "../../lib/deepseek";
import { getCandidateMoves } from "../../services/getCandidateMoves";
import { makeMove } from "../../services/makeMove";
import { createAiToolDefinition } from "../../services/aiFunctionCallingTool";

export const sendChatMessage: MutationResolvers["sendChatMessage"] = async (_parent, { input }) => {
  const { matchId, content, aiPersonality } = input;

  // ユーザーメッセージを作成
  await db.chatMessage.create({
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
    aiPersonality: aiPersonality ?? "none",
  });

  return { success: true };
};

/**
 * AI応答を生成してアシスタントメッセージを更新
 */
async function generateAndUpdateAiResponse(params: {
  matchId: string;
  content: string;
  assistantMessageId: string;
  aiPersonality: AiPersonality;
}): Promise<void> {
  try {
    const { matchId, content, assistantMessageId, aiPersonality } = params;
    const context = { matchId, aiPersonality };
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
    const tools = [getCandidateMoves, makeMove];
    const toolMap = new Map(tools.map((tool) => [tool.name, tool]));

    // Function Callingを有効にしてAI応答を生成
    const aiResponseContent = await generateChatResponse({
      userMessage: createChatContent(content, aiPersonality),
      conversationHistory,
      tools: tools.map((tool) => createAiToolDefinition(tool.name, tool.description, tool.args)),
      onToolCall: async (toolName, toolArgs) => {
        const tool = toolMap.get(toolName);
        if (!tool) {
          throw new Error(`Unknown tool: ${toolName}`);
        }

        // Zodでバリデーション
        const validatedArgs = tool.args.parse(toolArgs);
        // ツールを実行
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return await tool.execute(context, validatedArgs as any);
      },
    });

    // レスポンスが必要な場合のみAI応答メッセージを更新
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
            content: "申し訳ございません。AIの応答生成中にエラーが発生しました。",
          },
        ],
        isPartial: false,
      },
    });
  }
}

function createChatContent(content: string, aiPersonality: AiPersonality): string {
  const personalityInstructions = getPersonalityInstructions(aiPersonality);
  return `
ユーザー: ${content}

【最重要ルール - 必ず守ること】
- ユーザーが「打って」「指して」「動かして」などと言った場合、絶対にmakeMove関数を呼び出してください
- 「5六角」「2五歩(2六)」など手順のみをユーザーが言ってきた場合は、絶対にmakeMove関数を呼び出してください

応答の注意点：
- 評価値は「優勢」「互角」「劣勢」などの表現で説明してください
- 対局IDには直接言及しないでください
${personalityInstructions}`;
}

function getPersonalityInstructions(aiPersonality: AiPersonality): string {
  switch (aiPersonality) {
    case "always":
      return `- 常に相手を煽るような口調で応答してください
- 相手のミスを指摘する時は特に煽ってください
- 負けそうな時は、黙ってください。`;
    case "situational":
      return `- 戦況に応じて煽りを入れてください
- 自分が優勢の時は煽り、劣勢の時は控えめにしてください
- 相手が悪手を指した時は、煽ってください`;
    case "none":
    default:
      return `- 丁寧で礼儀正しい口調で応答してください
- 煽りや挑発は避けてください`;
  }
}
