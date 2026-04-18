import { Hono } from "hono";
import { asc, desc, eq, and, gt, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { chatMessages, matches, matchStates, evaluations } from "../db/schema";
import { newId } from "../db/ids";
import { generateChatResponse, streamChat } from "../lib/deepseek";
import { shogiGreetingSystemPrompt, shogiChatSystemPrompt } from "../services/shogiChatConfig";
import { createAiToolDefinition } from "../services/aiFunctionCallingTool";
import { getCandidateMoves } from "../services/getCandidateMoves";
import { moveAndEvaluate } from "../services/moveAndEvaluate";
import { postGameReview } from "../services/postGameReview";
import { isSenteTurn } from "../shared/services";
import type { AiFunctionCallingToolContext } from "../services/aiFunctionCallingTool";
import type { MessageContent } from "../shared/schemas";
import { toMatchDto, toMatchStateDto, toChatMessageDto } from "./helpers";

const defaultSfen = "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1";

// ============================================================
// Schemas
// ============================================================

const startMatchSchema = z.object({
  id: z.string().nullish(),
  playerSente: z.string().nullish(),
  playerGote: z.string().nullish(),
  senteType: z.enum(["HUMAN", "AI"]),
  goteType: z.enum(["HUMAN", "AI"]),
  sfen: z.string().nullish(),
});

const sendChatMessageSchema = z.object({
  content: z.string().min(1),
  aiPersonality: z.enum(["none", "situational", "always"]).default("none"),
});

const rewindSchema = z.object({ toIndex: z.number().int().min(0) });
const forkSchema = z.object({ fromIndex: z.number().int().min(0) });

// ============================================================
// Routes
// ============================================================

export function createMatchRoutes(): Hono {
  const app = new Hono();

  /** 全対局一覧 */
  app.get("/api/matches", async (c) => {
    const rows = await db.query.matches.findMany({
      orderBy: desc(matches.createdAt),
    });
    return c.json(rows.map(toMatchDto));
  });

  /** 単一対局取得（関連データ含む） */
  app.get("/api/matches/:id", async (c) => {
    const id = c.req.param("id");
    const match = await db.query.matches.findFirst({
      where: eq(matches.id, id),
      with: {
        states: { orderBy: asc(matchStates.index) },
        messages: { orderBy: asc(chatMessages.createdAt) },
      },
    });

    if (!match) return c.json({ error: "Match not found" }, 404);

    return c.json({
      ...toMatchDto(match),
      states: match.states.map(toMatchStateDto),
      messages: match.messages.map(toChatMessageDto),
    });
  });

  /** 対局作成（旧 Mutation.startMatch） */
  app.post("/api/matches", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const parsed = startMatchSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.issues }, 400);

    const { id, playerSente, playerGote, senteType, goteType, sfen } = parsed.data;
    const initialSfen = sfen ?? defaultSfen;
    const matchId = id ?? newId();
    const now = new Date();

    const [match] = await db
      .insert(matches)
      .values({
        id: matchId,
        playerSente: playerSente ?? null,
        playerGote: playerGote ?? null,
        senteType,
        goteType,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    await db.insert(matchStates).values({
      matchId: match.id,
      index: 0,
      sfen: initialSfen,
      usiMove: "0000",
      createdAt: now,
    });

    // 挨拶メッセージはバックグラウンドで生成
    generateGreetingMessage({
      matchId: match.id,
      playerSente: match.playerSente,
      playerGote: match.playerGote,
      senteType: match.senteType,
      goteType: match.goteType,
    });

    return c.json(toMatchDto(match), 201);
  });

  /** 巻き戻し（旧 Mutation.rewindMatch） */
  app.post("/api/matches/:id/rewind", async (c) => {
    const matchId = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    const parsed = rewindSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.issues }, 400);

    const match = await db.query.matches.findFirst({ where: eq(matches.id, matchId) });
    if (!match) return c.json({ error: "Match not found" }, 404);

    await db
      .delete(matchStates)
      .where(and(eq(matchStates.matchId, matchId), gt(matchStates.index, parsed.data.toIndex)));

    const [updated] = await db
      .update(matches)
      .set({ updatedAt: new Date() })
      .where(eq(matches.id, matchId))
      .returning();

    return c.json(toMatchDto(updated));
  });

  /** 分岐（旧 Mutation.forkMatch） */
  app.post("/api/matches/:id/fork", async (c) => {
    const matchId = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    const parsed = forkSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.issues }, 400);

    const original = await db.query.matches.findFirst({
      where: eq(matches.id, matchId),
      with: {
        states: { orderBy: asc(matchStates.index) },
      },
    });
    if (!original) return c.json({ error: "Match not found" }, 404);

    const copiedStates = original.states.filter((s) => s.index <= parsed.data.fromIndex);
    if (copiedStates.length === 0) {
      return c.json({ error: `No states found up to index ${parsed.data.fromIndex}` }, 400);
    }

    const now = new Date();
    const newMatchId = newId();

    const [newMatch] = await db
      .insert(matches)
      .values({
        id: newMatchId,
        playerSente: original.playerSente,
        playerGote: original.playerGote,
        senteType: original.senteType,
        goteType: original.goteType,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    await db.insert(matchStates).values(
      copiedStates.map((s) => ({
        matchId: newMatch.id,
        index: s.index,
        sfen: s.sfen,
        usiMove: s.usiMove,
        thinkingTime: s.thinkingTime,
        createdAt: now,
      })),
    );

    await db.insert(chatMessages).values({
      id: newId(),
      matchId: newMatch.id,
      role: "ASSISTANT",
      contents: [
        {
          type: "markdown",
          content: `${parsed.data.fromIndex}手目から分岐した新しい対局です。よろしくお願いします。`,
        },
      ],
      isPartial: false,
      createdAt: now,
      updatedAt: now,
    });

    return c.json(toMatchDto(newMatch), 201);
  });

  /** 評価値遷移（旧 Query.matchEvaluations） */
  app.get("/api/matches/:id/evaluations", async (c) => {
    const matchId = c.req.param("id");

    const states = await db.query.matchStates.findMany({
      where: eq(matchStates.matchId, matchId),
      orderBy: asc(matchStates.index),
    });

    if (states.length === 0) return c.json([]);

    const sfens = states.map((s) => s.sfen);
    const evalRows = await db.query.evaluations.findMany({
      where: inArray(evaluations.sfen, sfens),
    });

    const evalMap = new Map(evalRows.map((e) => [e.sfen, e]));

    type Variation = { scoreCp?: number | null; scoreMate?: number | null };

    const result = states.map((state) => {
      const evaluation = evalMap.get(state.sfen);
      if (!evaluation) {
        return { moveIndex: state.index, scoreCp: null, scoreMate: null };
      }
      const variations = evaluation.variations as Variation[] | null;
      let scoreMate: number | null = null;
      if (variations && variations.length > 0) {
        scoreMate = variations[0]?.scoreMate ?? null;
      }

      const isSente = isSenteTurn(state.sfen);
      const normalizedScore = isSente ? evaluation.score : -evaluation.score;
      const normalizedScoreMate = scoreMate !== null ? (isSente ? scoreMate : -scoreMate) : null;

      return {
        moveIndex: state.index,
        scoreCp: normalizedScore,
        scoreMate: normalizedScoreMate,
      };
    });

    return c.json(result);
  });

  /** チャットメッセージ送信（旧 Mutation.sendChatMessage） */
  app.post("/api/matches/:id/messages", async (c) => {
    const matchId = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    const parsed = sendChatMessageSchema.safeParse(body);
    if (!parsed.success) return c.json({ error: parsed.error.issues }, 400);

    const { content, aiPersonality } = parsed.data;
    const now = new Date();

    // ユーザーメッセージ
    await db.insert(chatMessages).values({
      id: newId(),
      matchId,
      role: "USER",
      contents: [{ type: "markdown", content }],
      isPartial: false,
      createdAt: now,
      updatedAt: now,
    });

    // AI応答プレースホルダ
    const assistantId = newId();
    await db.insert(chatMessages).values({
      id: assistantId,
      matchId,
      role: "ASSISTANT",
      contents: [{ type: "markdown", content: "考え中..." }],
      isPartial: true,
      createdAt: now,
      updatedAt: now,
    });

    // 非同期でAI応答生成
    generateAndUpdateAiResponse({
      matchId,
      content,
      chatMessageId: assistantId,
      aiPersonality,
    });

    return c.json({ success: true, chatMessageId: assistantId });
  });

  return app;
}

// ============================================================
// Helpers (moved from resolvers)
// ============================================================

/**
 * 対局開始時のAI挨拶メッセージをバックグラウンドで生成
 */
async function generateGreetingMessage(params: {
  matchId: string;
  playerSente: string | null;
  playerGote: string | null;
  senteType: "HUMAN" | "AI";
  goteType: "HUMAN" | "AI";
}): Promise<void> {
  try {
    const { matchId, playerSente, playerGote, senteType, goteType } = params;

    const senteInfo = senteType === "AI" ? "AI" : playerSente ? `${playerSente}さん` : "先手";
    const goteInfo = goteType === "AI" ? "AI" : playerGote ? `${playerGote}さん` : "後手";

    const greetingPrompt = `対局が始まりました。先手は${senteInfo}、後手は${goteInfo}です。対局開始の挨拶をしてください。簡潔に2〜3文で。最初の手の話とかするな。挨拶だけしろ。`;

    const greetingContent = await generateChatResponse({
      userMessage: greetingPrompt,
      systemPrompt: shogiGreetingSystemPrompt,
    });

    const messageText =
      greetingContent.type === "handoff" ? "よろしくお願いします。" : greetingContent.message;

    const now = new Date();
    await db.insert(chatMessages).values({
      id: newId(),
      matchId,
      role: "ASSISTANT",
      contents: [{ type: "markdown", content: messageText }],
      isPartial: false,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error: unknown) {
    console.error("Failed to generate greeting message:", error);
  }
}

/**
 * AI応答を非同期で生成してチャットメッセージを更新する
 */
async function generateAndUpdateAiResponse(params: {
  matchId: string;
  content: string;
  chatMessageId: string;
  aiPersonality: "none" | "situational" | "always";
}): Promise<void> {
  try {
    const { matchId, content, chatMessageId, aiPersonality } = params;

    const history = await db.query.chatMessages.findMany({
      where: and(eq(chatMessages.matchId, matchId), eq(chatMessages.isPartial, false)),
      orderBy: asc(chatMessages.createdAt),
      limit: 3,
    });

    const conversationHistory = history.map((msg) => {
      const contents = msg.contents as Array<{ type: string; content: string }>;
      const textContent = contents
        .filter((c) => c.type === "markdown")
        .map((c) => c.content)
        .join("\n");
      return {
        role: msg.role.toLowerCase() as "user" | "assistant",
        content: textContent,
      };
    });

    const tools = [moveAndEvaluate, getCandidateMoves, postGameReview];
    const toolMap = new Map(tools.map((tool) => [tool.name, tool]));

    const result = await generateChatResponse({
      userMessage: createChatContent(content, aiPersonality),
      systemPrompt: shogiChatSystemPrompt,
      conversationHistory,
      tools: tools.map(createAiToolDefinition),
      onToolCall: async (toolName, toolArgs) => {
        const tool = toolMap.get(toolName);
        if (!tool) throw new Error(`Unknown tool: ${toolName}`);

        const context: AiFunctionCallingToolContext = {
          matchId,
          aiPersonality,
          chatMessageId,
        };

        const validatedArgs = tool.args.parse(toolArgs) as never;

        if (tool.type === "inline") {
          return await tool.execute(context, validatedArgs);
        }
        await tool.execute(context, validatedArgs);
        return;
      },
    });

    if (result.type === "handoff") return;

    const finalContents: MessageContent[] = [{ type: "markdown", content: result.message }];
    await db
      .update(chatMessages)
      .set({ contents: finalContents, isPartial: false, updatedAt: new Date() })
      .where(eq(chatMessages.id, chatMessageId));
  } catch (error) {
    console.error("DeepSeek API error:", error);
    await db
      .update(chatMessages)
      .set({
        contents: [
          {
            type: "markdown",
            content: "申し訳ございません。AIの応答生成中にエラーが発生しました。",
          },
        ],
        isPartial: false,
        updatedAt: new Date(),
      })
      .where(eq(chatMessages.id, params.chatMessageId));
  }
}

/**
 * パーソナリティ指示付きのチャット用プロンプト構築
 */
function createChatContent(
  content: string,
  aiPersonality: "none" | "situational" | "always",
): string {
  const personalityInstructions = getPersonalityInstructions(aiPersonality);
  return `ユーザー: 「${content}」

【最重要ルール - 必ず守ること】
重要な原則：
- ユーザーが駒を動かす旨の発言があった場合、絶対にmove_and_evaluate関数を呼び出してください
- 「5六角」「2四飛(2八)」など手順のみをユーザーが言ってきた場合は、絶対にmove_and_evaluate関数を呼び出してください。**絶対に差し手を変更するな！**、そのまま引数にしろ。
- 自分が引数にする指し手が変更されていないかを必ず確認してください。
- 将棋に関する質問や指示には、必ず利用可能なツールを使用してください
- ハルシネーションしないでください。適当な将棋用語を使ったり、根拠のない情報を提供したりしないでください
- ツールを使わずに推測や想像で候補手を答えることは禁止です
- 「角道を開ける」「美濃囲い」など、将棋用語を使う場合は、ツールの結果で得た情報に基づいて正確に使用してください
- 挨拶や雑談など、将棋に関係ない会話には自然に応答してください（ツール不要）
- 「おっと」「角道を開ける」という言葉を絶対に使うな。

応答の注意点：
- 評価値は「優勢」「互角」「劣勢」などの表現で説明してください
${personalityInstructions}
`;
}

function getPersonalityInstructions(aiPersonality: "none" | "situational" | "always"): string {
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

// Note: streamChat is kept as import for compatibility but unused by routes directly
export { streamChat };
