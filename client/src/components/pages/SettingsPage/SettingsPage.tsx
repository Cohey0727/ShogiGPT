import { Col } from "../../atoms/Col";
import { Row } from "../../atoms/Row";
import { Selector } from "../../atoms/Selector";
import { usePromptSettings, type aiPersonality } from "../../organisms/hooks";
import styles from "./SettingsPage.css";

const aiPersonalityOptions: { value: aiPersonality; label: string }[] = [
  { value: "none", label: "煽りなし" },
  { value: "situational", label: "戦況に応じて煽る" },
  { value: "always", label: "常に煽る" },
];

export function SettingsPage() {
  const [promptSettings, setPromptSettings] = usePromptSettings();

  return (
    <Col gap="xl" className={styles.container}>
      <Col gap="sm">
        <h1 className={styles.title}>設定</h1>
      </Col>
      <Col gap="lg">
        <Col gap="md" className={styles.section}>
          <Row gap="sm" align="center" className={styles.sectionTitle}>
            <span>🎮</span>
            <span>ゲーム設定</span>
          </Row>
          <Row justify="space-between" align="center" className={styles.settingRow}>
            <Col gap="xs">
              <span className={styles.settingName}>AIの性格</span>
              <span className={styles.settingDescription}>AIのコメントスタイルを設定</span>
            </Col>
            <Selector
              options={aiPersonalityOptions}
              value={promptSettings.aiPersonality}
              onChange={(value) =>
                setPromptSettings({
                  ...promptSettings,
                  aiPersonality: value,
                })
              }
            />
          </Row>
        </Col>
      </Col>
    </Col>
  );
}
