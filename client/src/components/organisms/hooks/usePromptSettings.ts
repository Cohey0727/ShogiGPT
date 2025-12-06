import type { Dispatch, SetStateAction } from "react";

import { z } from "zod/v4";

import { useSafeLocalStorage } from "../../molecules/hooks/useSafeLocalStorage";
import { AiPersonality } from "../../../generated/graphql/types";
import { objectValues } from "../../../shared/utils";

/** AIパーソナリティのZodスキーマ */
const AiPersonalitySchema = z.enum(objectValues(AiPersonality));

/** プロンプト設定のスキーマ（MatchAiConfigsと同じフィールド、id/matchId/player/timestamps除く） */
const PromptSettingsSchema = z.object({
  depth: z.number().int().default(10),
  engineName: z.string().default("yaneuraou"),
  multiPv: z.number().int().default(1),
  personality: AiPersonalitySchema.default("none"),
  thinkTime: z.number().int().default(1000),
});

/**
 * プロンプト設定全体の型
 */
export type PromptSettings = z.infer<typeof PromptSettingsSchema>;

/** ローカルストレージのキー */
const promptSettingsKey = "shogi-gpt-prompt-settings";

/** デフォルト設定 */
const defaultPromptSettings = PromptSettingsSchema.parse({});

/**
 * プロンプト設定を管理するカスタムフック
 * @returns [設定値, 設定更新関数]
 */
export function usePromptSettings(): [PromptSettings, Dispatch<SetStateAction<PromptSettings>>] {
  return useSafeLocalStorage(promptSettingsKey, PromptSettingsSchema, defaultPromptSettings);
}
