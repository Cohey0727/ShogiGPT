import { BarChartIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from "@radix-ui/react-icons";

import { useModal } from "../../molecules/hooks/useModal";
import { EvaluationChartDialog } from "../EvaluationChartDialog";
import * as styles from "./StatusBar.css";
import { Suspense } from "react";
import { Loading } from "../../molecules";

interface StatusBarProps {
  currentTurn: "SENTE" | "GOTE";
  matchId: string;
  matchStateIndex: number;
  isAiThinking?: boolean;
  thinkingTimeMs?: number;
  winner?: "SENTE" | "GOTE" | null;
  isPaused: boolean;
  viewingStateIndex: number | null;
  totalStates: number;
  onPause: () => void;
  /** 再生ボタン押下時（ダイアログを開く） */
  onResumeClick: () => void;
  onViewingIndexChange: (index: number) => void;
}

export function StatusBar({
  currentTurn,
  matchId,
  matchStateIndex,
  isAiThinking = false,
  thinkingTimeMs,
  winner = null,
  isPaused,
  viewingStateIndex,
  totalStates,
  onPause,
  onResumeClick,
  onViewingIndexChange,
}: StatusBarProps) {
  const [isChartOpen, chartModal] = useModal();
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
            <DoubleArrowLeftIcon />
          </button>
        )}
        <span>{matchStateIndex + 1}手目</span>
        {isPaused ? (
          <button onClick={onResumeClick} className={styles.button}>
            ⏵
          </button>
        ) : (
          <button onClick={onPause} className={styles.button}>
            ⏸
          </button>
        )}
        {isPaused && (
          <button onClick={handleNext} disabled={!canGoNext} className={styles.button}>
            <DoubleArrowRightIcon />
          </button>
        )}
      </div>
      <div className={styles.rightSection}>
        {winner ? (
          <span className={styles.checkmate}>
            詰み - {winner === "SENTE" ? "☗先手" : "☖後手"}の勝ち
          </span>
        ) : (
          <span>{currentTurn === "SENTE" ? "☗先手" : "☖後手"}の番</span>
        )}
        <button onClick={() => chartModal.open()} className={styles.iconButton} title="評価値遷移">
          <BarChartIcon />
        </button>
      </div>
      <Suspense fallback={<Loading />}>
        <EvaluationChartDialog matchId={matchId} open={isChartOpen} onClose={chartModal.close} />
      </Suspense>
    </div>
  );
}
