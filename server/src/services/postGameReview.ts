import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { chatMessages, matches, matchStates } from "../db/schema";
import type {
  AiFunctionCallingToolContext,
  HandoffFunctionCallingTool,
} from "./aiFunctionCallingTool";
import { analyzeMoveTags } from "./analyzeMoveTags";
import { generateJsonResponse } from "../lib/deepseek";
import { evaluatePosition } from "../lib/evaluatePosition";
import type { PostGameAnalysisContent, TurningPoint, BestMoveWithComment } from "../shared/schemas";
import { applyUsiMove, formatMoveToJapanese, sfenToBoard } from "../shared/services";
import { takeMaxBy } from "../shared/utils/array";

const ArgsSchema = z.object({});

interface EvalDiff {
  index: number;
  before: number;
  after: number;
  usi: string;
  pv: string[] | null;
  sfen: string;
  absDiff: number;
}

interface MoveInfoForAi {
  move: string;
  japanese: string;
  tags: string[];
  turn: "player" | "ai";
}

interface TurningPointInfoForAi {
  index: number;
  evalDiff: number;
  bestMoves: MoveInfoForAi[];
}

const AiCommentsResponseSchema = z.object({
  turningPoints: z
    .array(
      z.object({
        index: z.number().describe("局面インデックス"),
        comment: z.string().describe("このターニングポイントに対するコメント（20〜40文字）"),
        bestMoves: z
          .array(
            z.object({
              move: z.string().describe("USI形式の指し手"),
              comment: z
                .string()
                .describe("この指し手の狙いや意味を説明するコメント（20〜40文字）"),
            }),
          )
          .describe("最善手順に対するコメント"),
      }),
    )
    .describe("各ターニングポイントへのコメント"),
});

async function generateTurningPointComments(
  turningPointsInfo: TurningPointInfoForAi[],
): Promise<z.infer<typeof AiCommentsResponseSchema>> {
  const systemPrompt = `あなたは将棋の感想戦をサポートするAIです。
ターニングポイント（形勢が大きく変わった局面）について、コメントを生成してください。

コメントの方針：
- 各ターニングポイントに対して、なぜその局面が重要だったかを簡潔に説明してください
- 各最善手に対して、その手の狙いや意味を簡潔に説明してください
- タグ情報を参考にして、戦術的な特徴を盛り込んでください
- 専門用語はタグ情報を参考にしてください
- 各コメントは簡潔に（各20〜40文字程度）
`;

  const userMessage = `以下のターニングポイントについてコメントを生成してください：

${JSON.stringify(turningPointsInfo, null, 2)}`;

  return generateJsonResponse({
    systemPrompt,
    userMessage,
    schema: AiCommentsResponseSchema,
  });
}

function buildBestMovesInfo(sfen: string, pv: string[]): MoveInfoForAi[] {
  const result: MoveInfoForAi[] = [];
  let currentBoard = sfenToBoard(sfen);
  const perspective = currentBoard.turn;

  for (const move of pv.slice(0, 5)) {
    const japanese = formatMoveToJapanese(move, currentBoard);
    const nextBoard = applyUsiMove(currentBoard, move);

    const tags = analyzeMoveTags({
      beforeBoard: currentBoard,
      afterBoard: nextBoard,
      usiMove: move,
      perspective,
    });

    const turn = currentBoard.turn === "SENTE" ? "player" : "ai";
    result.push({ move, japanese, tags, turn });
    currentBoard = nextBoard;
  }

  return result;
}

async function updateChatMessageWithError(
  chatMessageId: string,
  errorMessage: string,
): Promise<void> {
  await db
    .update(chatMessages)
    .set({
      role: "ASSISTANT",
      contents: [{ type: "markdown", content: errorMessage }],
      isPartial: false,
      updatedAt: new Date(),
    })
    .where(eq(chatMessages.id, chatMessageId));
}

function normalizeScore(scoreCp: number | null, turn: "b" | "w"): number | null {
  if (scoreCp === null) return null;
  return turn === "w" ? -scoreCp : scoreCp;
}

async function execute(context: AiFunctionCallingToolContext): Promise<void> {
  const { matchId, chatMessageId } = context;

  try {
    const match = await db.query.matches.findFirst({
      where: eq(matches.id, matchId),
    });

    if (!match) {
      await updateChatMessageWithError(chatMessageId, "対局情報が見つかりませんでした。");
      return;
    }

    const states = await db.query.matchStates.findMany({
      where: eq(matchStates.matchId, matchId),
      orderBy: asc(matchStates.index),
    });

    if (states.length < 2) {
      await updateChatMessageWithError(
        chatMessageId,
        "感想戦を行うには、少なくとも数手指す必要があります。",
      );
      return;
    }

    const humanPlayers: string[] = [];
    if (match.senteType === "HUMAN" && match.playerSente) {
      humanPlayers.push(match.playerSente);
    }
    if (match.goteType === "HUMAN" && match.playerGote) {
      humanPlayers.push(match.playerGote);
    }

    const playerNames =
      humanPlayers.length > 0 ? humanPlayers.map((name) => `${name}さん`).join("、") + "、" : "";
    const headerMessage = `${playerNames}感想戦を始めましょう。`;

    await db
      .update(chatMessages)
      .set({
        role: "ASSISTANT",
        contents: [{ type: "markdown", content: `${headerMessage}\n\n局面を分析中...` }],
        isPartial: true,
        updatedAt: new Date(),
      })
      .where(eq(chatMessages.id, chatMessageId));

    const evaluations = await Promise.all(
      states.map(async (state) => {
        const evalResult = await evaluatePosition(state.sfen, 5, 5000);
        const turn = state.sfen.split(" ")[1] as "b" | "w";
        const bestVariation = evalResult.variations[0];

        return {
          scoreCp: normalizeScore(bestVariation?.scoreCp ?? null, turn),
          pv: bestVariation?.pv ?? [],
          ...state,
        };
      }),
    );

    const ignoreThreshold = 3000;
    const evalDiffs = evaluations.slice(1).reduce<EvalDiff[]>((acc, curr, i) => {
      const prev = evaluations[i];

      if (prev.scoreCp === null || curr.scoreCp === null) return acc;

      const diff = curr.scoreCp - prev.scoreCp;
      if (
        Math.abs(curr.scoreCp) > ignoreThreshold &&
        Math.abs(prev.scoreCp) > ignoreThreshold &&
        curr.scoreCp * prev.scoreCp > 0
      ) {
        return acc;
      }

      const absDiff = Math.abs(diff);
      const prevTurn = prev.sfen.split(" ")[1] as "b" | "w";
      const wasBlunder = prevTurn === "b" ? diff < 0 : diff > 0;

      if (wasBlunder) {
        acc.push({
          index: prev.index,
          before: prev.scoreCp,
          after: curr.scoreCp,
          usi: states[i + 1].usiMove ?? "",
          pv: prev.pv,
          sfen: prev.sfen,
          absDiff,
        });
      }

      return acc;
    }, []);

    const maxTurningPoints = 5;
    const topDiffs = takeMaxBy(evalDiffs, maxTurningPoints, "absDiff").sort(
      (a, b) => a.index - b.index,
    );

    const turningPointsInfo: TurningPointInfoForAi[] = topDiffs.map((diff) => ({
      index: diff.index,
      evalDiff: diff.absDiff,
      bestMoves: buildBestMovesInfo(diff.sfen, diff.pv ?? []),
    }));

    await db
      .update(chatMessages)
      .set({
        role: "ASSISTANT",
        contents: [{ type: "markdown", content: `${headerMessage}\n\n考え中...` }],
        isPartial: true,
        updatedAt: new Date(),
      })
      .where(eq(chatMessages.id, chatMessageId));

    const aiComments = await generateTurningPointComments(turningPointsInfo);

    const turningPoints: TurningPoint[] = topDiffs.map((diff) => {
      const aiTp = aiComments.turningPoints.find((tp) => tp.index === diff.index);

      const bestMoves: BestMoveWithComment[] = (diff.pv?.slice(0, 5) ?? []).map((move, idx) => ({
        move,
        comment:
          aiTp?.bestMoves[idx]?.comment ?? formatMoveToJapanese(move, sfenToBoard(diff.sfen)),
      }));

      return {
        index: diff.index,
        sfen: diff.sfen,
        bestMoves,
        comment: aiTp?.comment ?? "この局面で形勢が大きく動きました。",
      };
    });

    const postGameAnalysisContent: PostGameAnalysisContent = {
      type: "postGameAnalysis",
      turningPoints,
    };

    const finalHeaderMessage =
      turningPoints.length > 0
        ? headerMessage
        : "この対局では大きなターニングポイントは見つかりませんでした。安定した対局でしたね。";

    await db
      .update(chatMessages)
      .set({
        role: "ASSISTANT",
        contents: [{ type: "markdown", content: finalHeaderMessage }, postGameAnalysisContent],
        isPartial: false,
        updatedAt: new Date(),
      })
      .where(eq(chatMessages.id, chatMessageId));
  } catch (error) {
    console.error("startPostGameAnalysis error:", error);
    await updateChatMessageWithError(
      chatMessageId,
      "感想戦中にエラーが発生しました。もう一度お試しください。",
    );
  }
}

const description = `感想戦を開始します。ユーザーが「感想戦をしよう」「感想お願いします」「対局を振り返りたい」などと言った場合に使用します。
対局中のターニングポイント（形勢が大きく変わった局面）を特定し、各局面での最善手とその解説を提供します。`;

export const postGameReview: HandoffFunctionCallingTool<typeof ArgsSchema> = {
  type: "handoff",
  name: "post_game_review",
  description,
  args: ArgsSchema,
  execute,
};
