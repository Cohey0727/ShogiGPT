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
 * Best move content type
 */
export const BestMoveContentSchema = z.object({
  type: z.literal("bestMove"),
  move: z.string(),
  evaluation: z.number().optional(),
  depth: z.number().optional(),
});

export type BestMoveContent = z.infer<typeof BestMoveContentSchema>;

/**
 * Union of all message content types
 */
export const MessageContentSchema = z.discriminatedUnion("type", [
  MarkdownContentSchema,
  BestMoveContentSchema,
]);

export type MessageContent = z.infer<typeof MessageContentSchema>;

/**
 * Array of message contents
 */
export const MessageContentsSchema = z.array(MessageContentSchema);

export type MessageContents = z.infer<typeof MessageContentsSchema>;
