import * as styles from "./StatusBar.css";

interface StatusBarProps {
  currentTurn: "SENTE" | "GOTE";
  matchStateIndex: number;
  isAiThinking?: boolean;
  thinkingTimeMs?: number;
  winner?: "SENTE" | "GOTE" | null;
  isPaused: boolean;
  viewingStateIndex: number | null;
  totalStates: number;
  onPause: () => void;
  onResume: (index: number) => void;
  onViewingIndexChange: (index: number) => void;
}

export function StatusBar({
  currentTurn,
  matchStateIndex,
  isAiThinking = false,
  thinkingTimeMs,
  winner = null,
  isPaused,
  viewingStateIndex,
  totalStates,
  onPause,
  onResume,
  onViewingIndexChange,
}: StatusBarProps) {
  const thinkingTimeSec = thinkingTimeMs ? (thinkingTimeMs / 1000).toFixed(1) : null;

  const canGoPrevious = isPaused && viewingStateIndex !== null && viewingStateIndex > 0;
  const canGoNext = isPaused && viewingStateIndex !== null && viewingStateIndex < totalStates - 1;

  const handlePrevious = () => {
    if (viewingStateIndex !== null && viewingStateIndex > 0) {
      onViewingIndexChange(viewingStateIndex - 1);
    }
  };

  const handleNext = () => {
    if (viewingStateIndex !== null && viewingStateIndex < totalStates - 1) {
      onViewingIndexChange(viewingStateIndex + 1);
    }
  };

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
      <div className={styles.controls}>
        {isPaused && (
          <button onClick={handlePrevious} disabled={!canGoPrevious} className={styles.button}>
            {`<<`}
          </button>
        )}
        <span>{matchStateIndex + 1}手目</span>
        {isPaused ? (
          <button onClick={() => onResume(viewingStateIndex ?? 0)} className={styles.button}>
            ⏵
          </button>
        ) : (
          <button onClick={onPause} className={styles.button}>
            ⏸
          </button>
        )}
        {isPaused && (
          <button onClick={handleNext} disabled={!canGoNext} className={styles.button}>
            {`>>`}
          </button>
        )}
      </div>
      {winner ? (
        <span className={styles.checkmate}>
          詰み - {winner === "SENTE" ? "☗先手" : "☖後手"}の勝ち
        </span>
      ) : (
        <span>{currentTurn === "SENTE" ? "☗先手" : "☖後手"}の番</span>
      )}
    </div>
  );
}
