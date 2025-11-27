import type { AiPersonality } from "./../generated/graphql/types";
import { z } from "zod";

export interface AiFunctionCallingToolContext {
  matchId: string;
  chatMessageId: string;
  aiPersonality: AiPersonality;
}

/**
 * Function Calling ツールの共通部分
 */
type BaseFunctionCallingTool<TArgs extends z.ZodTypeAny, TResult> = {
  name: string;
  description: string;
  args: TArgs;
  execute: (context: AiFunctionCallingToolContext, args: z.infer<TArgs>) => Promise<TResult>;
};

/**
 * Inline Tool: AIの会話フロー内で使用
 * 結果はLLMにフィードバックされ、最終応答生成に使われる
 * undefined を返すと handoff として扱われる（後続処理に制御を委譲）
 */
export type InlineFunctionCallingTool<TArgs extends z.ZodTypeAny> = BaseFunctionCallingTool<
  TArgs,
  string | undefined
> & {
  type: "inline";
};

/**
 * Handoff Tool: 処理を別APIに引き継ぐ
 * LLMはトリガー役で、処理完了後は別のシステムに制御を渡す
 * 戻り値は不要（void）
 */
export type HandoffFunctionCallingTool<TArgs extends z.ZodTypeAny> = BaseFunctionCallingTool<
  TArgs,
  void
> & {
  type: "handoff";
};

/**
 * Function Calling ツールの共用型
 */
export type AiFunctionCallingTool<TArgs extends z.ZodTypeAny = z.ZodTypeAny> =
  | InlineFunctionCallingTool<TArgs>
  | HandoffFunctionCallingTool<TArgs>;

/**
 * Helper function to create an AI tool definition from Zod schema
 * Uses Zod's built-in toJSONSchema and reformats for OpenAI compatibility
 */
export function createAiToolDefinition<TArgs extends z.ZodTypeAny>(
  tool: AiFunctionCallingTool<TArgs>,
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
