import type { ChangeEvent } from "react";

import { Button } from "../../atoms/Button";
import { Col } from "../../atoms/Col";
import { Row } from "../../atoms/Row";
import { useLocalStorage } from "../../molecules/hooks/useLocalStorage";
import styles from "./SettingsPage.css";

/**
 * AI煽りモードの種類
 * - none: 煽りなし
 * - situational: 戦況に応じて煽る
 * - always: 常に煽る
 */
export type AiTauntMode = "none" | "situational" | "always";

/** ローカルストレージのキー */
const SETTINGS_KEY = "shogi-gpt-settings";

export function SettingsPage() {
  const [aiTauntMode, setAiTauntMode] = useLocalStorage<AiTauntMode>({
    key: `${SETTINGS_KEY}.aiTauntMode`,
    initialValue: "none",
  });

  const handleAiTauntModeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setAiTauntMode(e.target.value as AiTauntMode);
  };

  return (
    <Col gap="xl" className={styles.container}>
      <Col gap="sm" className={styles.header}>
        <h1 className={styles.title}>設定</h1>
        <p className={styles.subtitle}>
          あなたの将棋体験をカスタマイズしましょう
        </p>
      </Col>

      <Col gap="lg" className={styles.content}>
        <Col gap="md" className={styles.section}>
          <Row gap="sm" align="center" className={styles.sectionTitle}>
            <span>🎮</span>
            <span>ゲーム設定</span>
          </Row>
          <Row justify="space-between" align="center" className={styles.settingRow}>
            <Col gap="xs" className={styles.settingLabel}>
              <span className={styles.settingName}>AI難易度</span>
              <span className={styles.settingDescription}>
                AIの強さを選択してください
              </span>
            </Col>
            <select className={styles.select}>
              <option>初級</option>
              <option>中級</option>
              <option>上級</option>
              <option>プロ</option>
            </select>
          </Row>
          <Row justify="space-between" align="center" className={styles.settingRow}>
            <Col gap="xs" className={styles.settingLabel}>
              <span className={styles.settingName}>持ち時間</span>
              <span className={styles.settingDescription}>
                1局あたりの制限時間
              </span>
            </Col>
            <select className={styles.select}>
              <option>10分</option>
              <option>20分</option>
              <option>30分</option>
              <option>無制限</option>
            </select>
          </Row>
          <Row justify="space-between" align="center" className={styles.settingRow}>
            <Col gap="xs" className={styles.settingLabel}>
              <span className={styles.settingName}>AI煽りモード</span>
              <span className={styles.settingDescription}>
                AIの煽りコメントを設定
              </span>
            </Col>
            <select
              className={styles.select}
              value={aiTauntMode}
              onChange={handleAiTauntModeChange}
            >
              <option value="none">煽りなし</option>
              <option value="situational">戦況に応じて煽る</option>
              <option value="always">常に煽る</option>
            </select>
          </Row>
        </Col>

        <Col gap="md" className={styles.section}>
          <Row gap="sm" align="center" className={styles.sectionTitle}>
            <span>🎨</span>
            <span>表示設定</span>
          </Row>
          <Row justify="space-between" align="center" className={styles.settingRow}>
            <Col gap="xs" className={styles.settingLabel}>
              <span className={styles.settingName}>盤面テーマ</span>
              <span className={styles.settingDescription}>
                将棋盤のデザインを選択
              </span>
            </Col>
            <select className={styles.select}>
              <option>クラシック</option>
              <option>モダン</option>
              <option>ダーク</option>
            </select>
          </Row>
          <Row justify="space-between" align="center" className={styles.settingRow}>
            <Col gap="xs" className={styles.settingLabel}>
              <span className={styles.settingName}>駒のデザイン</span>
              <span className={styles.settingDescription}>
                駒の表示スタイル
              </span>
            </Col>
            <select className={styles.select}>
              <option>一字駒</option>
              <option>二字駒</option>
              <option>草書体</option>
            </select>
          </Row>
        </Col>

        <Col gap="md" className={styles.section}>
          <Row gap="sm" align="center" className={styles.sectionTitle}>
            <span>🔔</span>
            <span>通知設定</span>
          </Row>
          <Row justify="space-between" align="center" className={styles.settingRow}>
            <Col gap="xs" className={styles.settingLabel}>
              <span className={styles.settingName}>効果音</span>
              <span className={styles.settingDescription}>
                駒を動かした時の音
              </span>
            </Col>
            <select className={styles.select}>
              <option>ON</option>
              <option>OFF</option>
            </select>
          </Row>
          <Row justify="space-between" align="center" className={styles.settingRow}>
            <Col gap="xs" className={styles.settingLabel}>
              <span className={styles.settingName}>対局終了通知</span>
              <span className={styles.settingDescription}>
                対局が終了した時の通知
              </span>
            </Col>
            <select className={styles.select}>
              <option>ON</option>
              <option>OFF</option>
            </select>
          </Row>
        </Col>

        <Button>設定を保存</Button>
      </Col>
    </Col>
  );
}
