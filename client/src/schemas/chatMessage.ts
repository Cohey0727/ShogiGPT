import { z } from "zod";

/**
 * Markdown content type
 */
export const MarkdownContentSchema = z.object({
  type: z.literal("markdown"),
  content: z.string(),
});

export type MarkdownContent = z.infer<typeof MarkdownContentSchema>;

/**
 * Move info (variation)
 */
export const MoveInfoSchema = z.object({
  move: z.string().describe("指し手（例: '7g7f'）"),
  scoreCp: z
    .number()
    .nullable()
    .optional()
    .describe("センチポーン単位の評価値（100 = 1ポーン有利）"),
  scoreMate: z
    .number()
    .nullable()
    .optional()
    .describe("詰みまでの手数（正の数=自分の勝ち、負の数=相手の勝ち）"),
  depth: z.number().describe("探索深度"),
  nodes: z.number().nullable().optional().describe("探索したノード数"),
  pv: z.array(z.string()).nullable().optional().describe("予想読み筋（Principal Variation）"),
});

export type MoveInfo = z.infer<typeof MoveInfoSchema>;

/**
 * Best move content type (analysis response)
 */
export const BestMoveContentSchema = z.object({
  type: z.literal("bestmove"),
  bestmove: z.string(),
  variations: z.array(MoveInfoSchema),
  timeMs: z.number(),
  engineName: z.string(),
  sfen: z.string().describe("SFEN形式の局面情報"),
});

export type BestMoveContent = z.infer<typeof BestMoveContentSchema>;

/**
 * Best move with comment (for post-game analysis)
 */
export const BestMoveWithCommentSchema = z.object({
  move: z.string().describe("USI形式の指し手"),
  comment: z.string().describe("この手に対するコメント"),
});

export type BestMoveWithComment = z.infer<typeof BestMoveWithCommentSchema>;

/**
 * Turning point in the game (for post-game analysis)
 */
export const TurningPointSchema = z.object({
  index: z.number().describe("悪手となった一手の直前の局面インデックス"),
  sfen: z.string().describe("SFEN形式の局面"),
  bestMoves: z.array(BestMoveWithCommentSchema).max(5).describe("最善手（最大5手分）"),
  comment: z.string().describe("AIによるコメント・解説"),
});

export type TurningPoint = z.infer<typeof TurningPointSchema>;

/**
 * Post-game analysis content type (感想戦)
 */
export const PostGameAnalysisContentSchema = z.object({
  type: z.literal("postGameAnalysis"),
  turningPoints: z.array(TurningPointSchema).describe("ターニングポイント一覧"),
});

export type PostGameAnalysisContent = z.infer<typeof PostGameAnalysisContentSchema>;

/**
 * Union of all message content types
 */
export const MessageContentSchema = z.discriminatedUnion("type", [
  MarkdownContentSchema,
  BestMoveContentSchema,
  PostGameAnalysisContentSchema,
]);

export type MessageContent = z.infer<typeof MessageContentSchema>;

/**
 * Array of message contents
 */
export const MessageContentsSchema = z.array(MessageContentSchema);

export type MessageContents = z.infer<typeof MessageContentsSchema>;
