import type { AiPersonality } from "./../generated/graphql/types";
import type { MessageContent } from "../shared/schemas";
import { z } from "zod";

export interface AiFunctionCallingToolContext {
  matchId: string;
  chatMessageId: string;
  aiPersonality: AiPersonality;
  /**
   * メッセージコンテンツを溜めておける
   */
  appendMessageContent: (content: MessageContent) => void;
  /**
   * AI応答生成完了時に実行するコールバックを登録する
   */
  appendCallbacks: (callback: () => Promise<void>) => void;
}

export type AiFunctionCallingTool<TArgs extends z.ZodTypeAny, TResult = unknown> = {
  name: string;
  description: string;
  args: TArgs;
  execute: (context: AiFunctionCallingToolContext, args: z.infer<TArgs>) => Promise<TResult>;
};

/**
 * Helper function to create an AI tool definition from Zod schema
 * Uses Zod's built-in toJSONSchema and reformats for OpenAI compatibility
 */
export function createAiToolDefinition<TArgs extends z.ZodTypeAny>(
  tool: AiFunctionCallingTool<TArgs, unknown>,
) {
  // Use Zod's built-in JSON Schema conversion
  const jsonSchema = z.toJSONSchema(tool.args) as Record<string, unknown>;

  // Remove unsupported fields for OpenAI function calling
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { $schema, $defs, definitions, additionalProperties, ...cleanSchema } = jsonSchema;

  return {
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: cleanSchema,
    },
  };
}
