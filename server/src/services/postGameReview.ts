import { z } from "zod";
import type {
  AiFunctionCallingToolContext,
  HandoffFunctionCallingTool,
} from "./aiFunctionCallingTool";
import { analyzeMoveTags } from "./analyzeMoveTags";
import { db } from "../lib/db";
import { generateJsonResponse } from "../lib/deepseek";
import { evaluatePosition } from "../lib/evaluatePosition";
import type { PostGameAnalysisContent, TurningPoint, BestMoveWithComment } from "../shared/schemas";
import { applyUsiMove, formatMoveToJapanese, sfenToBoard } from "../shared/services";
import { takeMaxBy } from "../shared/utils/array";

const ArgsSchema = z.object({});

/**
 * 局面間の評価値差分情報
 */
interface EvalDiff {
  /** 局面インデックス */
  index: number;
  /** 変動前の評価値 */
  before: number;
  /** 変動後の評価値 */
  after: number;
  /** USI形式の指し手 */
  usi: string;
  /** 最善手の読み筋 */
  pv: string[] | null;
  /** SFEN形式の局面 */
  sfen: string;
  /** 評価値の絶対差分 */
  absDiff: number;
}

/**
 * AIに送る指し手情報
 */
interface MoveInfoForAi {
  /** USI形式の指し手 */
  move: string;
  /** 日本語の指し手表記 */
  japanese: string;
  /** 戦術タグ */
  tags: string[];
  /** 手番（"player" = ユーザー, "ai" = AI） */
  turn: "player" | "ai";
}

/**
 * AIに送るターニングポイント情報
 */
interface TurningPointInfoForAi {
  /** 局面インデックス */
  index: number;
  /** 評価値の差分 */
  evalDiff: number;
  /** 最善手順 */
  bestMoves: MoveInfoForAi[];
}

/**
 * AIが生成するコメントのスキーマ
 */
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

/**
 * AIを使ってターニングポイントのコメントを生成する
 *
 * @param turningPointsInfo - ターニングポイント情報の配列
 * @returns AIが生成したコメント
 */
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

/**
 * 最善手順の情報を構築する
 *
 * @param sfen - 開始局面のSFEN
 * @param pv - 最善手順（USI形式の配列）
 * @returns AIに送る指し手情報の配列
 */
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

    // ユーザーは先手(SENTE)、AIは後手(GOTE)
    const turn = currentBoard.turn === "SENTE" ? "player" : "ai";

    result.push({ move, japanese, tags, turn });
    currentBoard = nextBoard;
  }

  return result;
}

/**
 * エラーメッセージでChatMessageを更新する
 *
 * @param chatMessageId - 更新対象のChatMessage ID
 * @param errorMessage - 表示するエラーメッセージ
 */
async function updateChatMessageWithError(
  chatMessageId: string,
  errorMessage: string,
): Promise<void> {
  await db.chatMessage.update({
    where: { id: chatMessageId },
    data: {
      role: "ASSISTANT",
      contents: [{ type: "markdown", content: errorMessage }],
      isPartial: false,
    },
  });
}

/**
 * 評価値を正規化（先手視点に統一）
 *
 * @param scoreCp - センチポーン単位の評価値
 * @param turn - 手番（"b" = 先手、"w" = 後手）
 * @returns 先手視点に正規化された評価値、またはnull
 */
function normalizeScore(scoreCp: number | null, turn: "b" | "w"): number | null {
  if (scoreCp === null) return null;
  // 後手番の場合は符号を反転して先手視点に統一
  return turn === "w" ? -scoreCp : scoreCp;
}

/**
 * 感想戦を開始する
 *
 * 対局の全局面を分析し、ターニングポイント（評価値が大きく変動した箇所）を特定する。
 * 各ターニングポイントでの最善手とコメントを生成し、ChatMessageに保存する。
 *
 * @param context - Function Callingツールのコンテキスト
 */
async function execute(context: AiFunctionCallingToolContext): Promise<void> {
  const { matchId, chatMessageId } = context;

  try {
    // 対局情報を取得
    const match = await db.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      await updateChatMessageWithError(chatMessageId, "対局情報が見つかりませんでした。");
      return;
    }

    // 全局面を取得
    const states = await db.matchState.findMany({
      where: { matchId },
      orderBy: { index: "asc" },
    });

    if (states.length < 2) {
      await updateChatMessageWithError(
        chatMessageId,
        "感想戦を行うには、少なくとも数手指す必要があります。",
      );
      return;
    }

    // 進捗表示を更新
    await db.chatMessage.update({
      where: { id: chatMessageId },
      data: {
        role: "ASSISTANT",
        contents: [{ type: "markdown", content: "局面を分析中..." }],
        isPartial: true,
      },
    });

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

    // すでに勝敗が決まっている場合は、候補から除外
    const ignoreThreshold = 3000;
    // 各局面間の評価値差分を計算（before, after, usi, indexの配列）
    const evalDiffs = evaluations.slice(1).reduce<EvalDiff[]>((acc, curr, i) => {
      const prev = evaluations[i];

      if (prev.scoreCp === null || curr.scoreCp === null) return acc;

      const diff = curr.scoreCp - prev.scoreCp;
      if (
        Math.abs(curr.scoreCp) > ignoreThreshold &&
        Math.abs(prev.scoreCp) > ignoreThreshold &&
        curr.scoreCp * prev.scoreCp > 0
      ) {
        // もう勝敗が決まっている場合は無視
        return acc;
      }

      const absDiff = Math.abs(diff);

      // 悪手を指したのは前の局面の手番側
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

    /** 取得するターニングポイントの最大数 */
    const maxTurningPoints = 5;
    const topDiffs = takeMaxBy(evalDiffs, maxTurningPoints, "absDiff").sort(
      (a, b) => a.index - b.index,
    );

    // AIにコメントを生成させるための情報を構築
    const turningPointsInfo: TurningPointInfoForAi[] = topDiffs.map((diff) => ({
      index: diff.index,
      evalDiff: diff.absDiff,
      bestMoves: buildBestMovesInfo(diff.sfen, diff.pv ?? []),
    }));

    // 進捗表示を更新
    await db.chatMessage.update({
      where: { id: chatMessageId },
      data: {
        role: "ASSISTANT",
        contents: [{ type: "markdown", content: "考え中..." }],
        isPartial: true,
      },
    });

    // AIでコメントを生成
    const aiComments = await generateTurningPointComments(turningPointsInfo);

    // ターニングポイントを生成
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

    // 結果を生成
    const postGameAnalysisContent: PostGameAnalysisContent = {
      type: "postGameAnalysis",
      turningPoints,
    };

    // メッセージを更新
    const markdownContent =
      turningPoints.length > 0
        ? `感想戦を始めましょう。`
        : "この対局では大きなターニングポイントは見つかりませんでした。安定した対局でしたね。";

    await db.chatMessage.update({
      where: { id: chatMessageId },
      data: {
        role: "ASSISTANT",
        contents: [{ type: "markdown", content: markdownContent }, postGameAnalysisContent],
        isPartial: false,
      },
    });
  } catch (error) {
    console.error("startPostGameAnalysis error:", error);
    await updateChatMessageWithError(
      chatMessageId,
      "感想戦中にエラーが発生しました。もう一度お試しください。",
    );
  }
}

const description = `感想戦を開始します。ユーザーが「感想戦をしよう」「対局を振り返りたい」などと言った場合に使用します。
対局中のターニングポイント（形勢が大きく変わった局面）を特定し、各局面での最善手とその解説を提供します。`;

export const postGameReview: HandoffFunctionCallingTool<typeof ArgsSchema> = {
  type: "handoff",
  name: "post_game_review",
  description,
  args: ArgsSchema,
  execute,
};
