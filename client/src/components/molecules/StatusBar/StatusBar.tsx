import * as styles from "./StatusBar.css";

interface StatusBarProps {
  currentTurn: "SENTE" | "GOTE";
  moveNumber: number;
  isAiThinking?: boolean;
  thinkingTimeMs?: number;
}

export function StatusBar({
  currentTurn,
  moveNumber,
  isAiThinking = false,
  thinkingTimeMs,
}: StatusBarProps) {
  const thinkingTimeSec = thinkingTimeMs
    ? (thinkingTimeMs / 1000).toFixed(1)
    : null;

  return (
    <div className={styles.container}>
      <span>
        {isAiThinking && (
          <span className={styles.thinking}>
            AI思考中...
            {thinkingTimeSec && ` (${thinkingTimeSec}秒)`}
          </span>
        )}
      </span>
      <span>{moveNumber + 1}手目</span>
      <span>{currentTurn === "SENTE" ? "☗先手" : "☖後手"}の番</span>
    </div>
  );
}
