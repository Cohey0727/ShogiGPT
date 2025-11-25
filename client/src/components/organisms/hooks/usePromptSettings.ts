import { useMemo, type Dispatch, type SetStateAction } from "react";

import { z } from "zod/v4";

import { useLocalStorage } from "../../molecules/hooks/useLocalStorage";

/**
 * AIプロンプトのパーソナリティ
 */
export const AiPersonalitySchema = z.enum(["none", "situational", "always"]);

export type aiPersonality = z.infer<typeof AiPersonalitySchema>;

/**
 * プロンプト設定全体のスキーマ
 */
export const PromptSettingsSchema = z.object({
  aiPersonality: AiPersonalitySchema,
});

export type PromptSettings = z.infer<typeof PromptSettingsSchema>;

/** ローカルストレージのキー */
const PROMPT_SETTINGS_KEY = "shogi-gpt-prompt-settings";

/** デフォルト設定 */
const DEFAULT_PROMPT_SETTINGS: PromptSettings = {
  aiPersonality: "none",
};

/**
 * プロンプト設定を管理するカスタムフック
 * @returns [設定値, 設定更新関数]
 */
export function usePromptSettings(): [PromptSettings, Dispatch<SetStateAction<PromptSettings>>] {
  const [rawSettings, setRawSettings] = useLocalStorage<PromptSettings>({
    key: PROMPT_SETTINGS_KEY,
    initialValue: DEFAULT_PROMPT_SETTINGS,
  });

  const settings = useMemo(() => {
    const result = PromptSettingsSchema.safeParse(rawSettings);
    if (result.success) {
      return result.data;
    }
    return DEFAULT_PROMPT_SETTINGS;
  }, [rawSettings]);

  return [settings, setRawSettings];
}
