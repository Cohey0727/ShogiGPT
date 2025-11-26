import type { AiPersonality, MutationResolvers } from "../../generated/graphql/types";
import { db } from "../../lib/db";
import { generateChatResponse } from "../../lib/deepseek";
import { moveAndEvaluate } from "../../services/moveAndEvaluate";
import type { AiFunctionCallingToolContext } from "../../services/aiFunctionCallingTool";
import { createAiToolDefinition } from "../../services/aiFunctionCallingTool";
import type { MessageContent } from "../../shared/schemas";

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

    // 溜めておくコンテンツの配列
    const pendingContents: MessageContent[] = [];
    // 完了時に実行するコールバックの配列
    const pendingCallbacks: Array<() => Promise<void>> = [];

    /**
     * メッセージコンテンツを溜めておき、最後の更新で一緒に反映する
     */
    const appendMessageContent = (messageContent: MessageContent): void => {
      pendingContents.push(messageContent);
    };

    /**
     * AI応答生成完了時に実行するコールバックを登録する
     */
    const appendCallbacks = (callback: () => Promise<void>): void => {
      pendingCallbacks.push(callback);
    };

    const context: AiFunctionCallingToolContext = {
      matchId,
      aiPersonality,
      chatMessageId: assistantMessageId,
      appendMessageContent,
      appendCallbacks,
    };
    // 会話履歴を取得（最新3件、partial除外）
    const history = await db.chatMessage.findMany({
      where: { matchId, isPartial: false, role: "USER" },
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
    const tools = [moveAndEvaluate];
    const toolMap = new Map(tools.map((tool) => [tool.name, tool]));

    // Function Callingを有効にしてAI応答を生成
    const aiResponseContent = await generateChatResponse({
      userMessage: createChatContent(content, aiPersonality),
      conversationHistory,
      tools: tools.map(createAiToolDefinition),
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

    // 溜めたコンテンツとAI応答を一緒に反映
    const finalContents: MessageContent[] = [
      { type: "markdown", content: aiResponseContent },
      ...pendingContents,
    ];

    await db.chatMessage.update({
      where: { id: assistantMessageId },
      data: {
        contents: finalContents,
        isPartial: false,
      },
    });

    // 登録されたコールバックを実行
    await Promise.all(pendingCallbacks.map((callback) => callback()));
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
  return `ユーザー: 「${content}」

【最重要ルール - 必ず守ること】
重要な原則：
- ユーザーが指し手を指示した場合は、必ずmove_and_evaluateツールで実際に盤面を更新してください
- 将棋に関する質問や指示には、必ず利用可能なツールを使用してください
- ハルシネーションしないでください。適当な将棋用語を使ったり、根拠のない情報を提供したりしないでください
- ツールを使わずに推測や想像で候補手を答えることは禁止です
- 「角道を開ける」「美濃囲い」など、将棋用語を使う場合は、ツールの結果で得た情報に基づいて正確に使用してください
- 挨拶や雑談など、将棋に関係ない会話には自然に応答してください（ツール不要）
- ユーザーが「打って」「指して」「動かして」などと言った場合、絶対にmove_and_evaluate関数を呼び出してください
- 「5六角」「2五歩(2六)」など手順のみをユーザーが言ってきた場合は、絶対にmove_and_evaluate関数を呼び出してください
- 「おっと」「角道を開ける」という言葉を絶対に使うな。

応答の注意点：
- 評価値は「優勢」「互角」「劣勢」などの表現で説明してください
${personalityInstructions}
`;
}

function getPersonalityInstructions(aiPersonality: AiPersonality): string {
  switch (aiPersonality) {
    case "always":
      return `- 常に相手を煽るような口調で応答してください
- 相手のミスを指摘する時は特に煽ってください`;
    case "situational":
      return `- 普段は、丁寧で礼儀正しい口調で応答してください
- 相手が悪手を指した時は、調子に乗って煽ってください`;
    case "none":
    default:
      return `- 丁寧で礼儀正しい口調で応答してください
- 煽りや挑発は避けてください`;
  }
}
