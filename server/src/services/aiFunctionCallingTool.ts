import { AiPersonality } from "./../generated/graphql/types";
import { z } from "zod";

export interface AiFunctionCallingToolContext {
  matchId: string;
  aiPersonality: AiPersonality;
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
  name: string,
  description: string,
  argsSchema: TArgs,
) {
  // Use Zod's built-in JSON Schema conversion
  const jsonSchema = z.toJSONSchema(argsSchema) as Record<string, unknown>;

  // Remove unsupported fields for OpenAI function calling
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { $schema, $defs, definitions, additionalProperties, ...cleanSchema } = jsonSchema;

  return {
    type: "function" as const,
    function: {
      name,
      description,
      parameters: cleanSchema,
    },
  };
}
