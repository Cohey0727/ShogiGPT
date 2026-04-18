import { z } from "zod";

/** /analyze リクエストのバリデーションスキーマ */
export const analyzeRequestSchema = z.object({
  sfen: z.string().nullable().optional(),
  moves: z.array(z.string()).nullable().optional(),
  time_ms: z.number().int().min(100).max(60_000).default(1000),
  depth: z.number().int().min(1).max(30).nullable().optional(),
  multipv: z.number().int().min(1).max(10).default(1),
});

/** /mate リクエストのバリデーションスキーマ */
export const mateSearchRequestSchema = z.object({
  sfen: z.string().nullable().optional(),
  moves: z.array(z.string()).nullable().optional(),
  time_ms: z.number().int().min(1000).max(30_000).default(5000),
});

export type AnalyzeRequestBody = z.infer<typeof analyzeRequestSchema>;
export type MateSearchRequestBody = z.infer<typeof mateSearchRequestSchema>;
