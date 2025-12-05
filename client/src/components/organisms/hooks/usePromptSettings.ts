import type { Dispatch, SetStateAction } from "react";

import { z } from "zod/v4";

import { useSafeLocalStorage } from "../../molecules/hooks/useSafeLocalStorage";

/**
 * AIプロンプトのパーソナリティ
 */
export const AiPersonalitySchema = z.enum(["none", "situational", "always"]);

export type aiPersonality = z.infer<typeof AiPersonalitySchema>;

/** プロンプト設定のスキーマオブジェクト */
const promptSettingsSchema = {
  aiPersonality: AiPersonalitySchema,
};

/**
 * プロンプト設定全体の型
 */
export type PromptSettings = {
  aiPersonality: aiPersonality;
};

/** ローカルストレージのキー */
const promptSettingsKey = "shogi-gpt-prompt-settings";

/** デフォルト設定 */
const defaultPromptSettings: PromptSettings = {
  aiPersonality: "none",
};

/**
 * プロンプト設定を管理するカスタムフック
 * @returns [設定値, 設定更新関数]
 */
export function usePromptSettings(): [PromptSettings, Dispatch<SetStateAction<PromptSettings>>] {
  return useSafeLocalStorage(promptSettingsKey, promptSettingsSchema, defaultPromptSettings);
}
