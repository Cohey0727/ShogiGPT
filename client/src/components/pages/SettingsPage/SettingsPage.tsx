import { Col } from "../../atoms/Col";
import { Row } from "../../atoms/Row";
import { Selector } from "../../atoms/Selector";
import {
  usePromptSettings,
  type AiPromptPersonality,
} from "../../organisms/hooks";
import styles from "./SettingsPage.css";

const aiPersonalityOptions: { value: AiPromptPersonality; label: string }[] = [
  { value: "none", label: "煽りなし" },
  { value: "situational", label: "戦況に応じて煽る" },
  { value: "always", label: "常に煽る" },
];

export function SettingsPage() {
  const [promptSettings, setPromptSettings] = usePromptSettings();

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
          <Row
            justify="space-between"
            align="center"
            className={styles.settingRow}
          >
            <Col gap="xs" className={styles.settingLabel}>
              <span className={styles.settingName}>AIの性格</span>
              <span className={styles.settingDescription}>
                AIのコメントスタイルを設定
              </span>
            </Col>
            <Selector
              options={aiPersonalityOptions}
              value={promptSettings.aiPromptPersonality}
              onChange={(value) =>
                setPromptSettings({
                  ...promptSettings,
                  aiPromptPersonality: value,
                })
              }
            />
          </Row>
        </Col>
      </Col>
    </Col>
  );
}
