import { useParams } from "wouter";
import { useState, useCallback, useMemo } from "react";
import { ShogiTable, MatchChat, StatusBar, ResumeDialog, usePromptSettings } from "../../organisms";
import {
  useGetMatchQuery,
  useSubscribeMatchStatesSubscription,
  useSendChatMessageMutation,
} from "../../../generated/graphql/types";
import { useModal } from "../../molecules/hooks/useModal";
import styles from "./MatchDetailPage.css";
import type { Board } from "../../../shared/consts";
import {
  sfenToBoard,
  createInitialBoard,
  calculateDiffCells,
  getWinner,
  formatMoveToJapanese,
} from "../../../shared/services";
import { Col, ResizableContainer } from "../../atoms";
import { useChatMessageStream } from "../../organisms/hooks/useChatMessageStream";

interface BoardState {
  board: Board;
  moveIndex: number;
  previousBoard: Board | null;
}

/** 楽観的更新用の局面状態 */
interface OptimisticState {
  board: Board;
  moveIndex: number;
}

export function MatchDetailPage() {
  const params = useParams<{ matchId: string }>();
  const matchId = params.matchId;

  const [{ data: matchData }] = useGetMatchQuery({
    variables: { matchId },
    pause: !matchId,
  });
  const match = matchData?.matchesByPk;

  // MatchStatesをSubscriptionで監視
  const [{ data: matchStatesData }] = useSubscribeMatchStatesSubscription({
    variables: { matchId },
    pause: !matchId,
  });

  const [messages] = useChatMessageStream({ matchId });

  const [, sendChatMessage] = useSendChatMessageMutation();
  const [promptSettings] = usePromptSettings();
  const [isResumeDialogOpen, resumeDialogModal] = useModal();

  if (!match) {
    throw new Error("Match not found");
  }

  /**
   * 現在表示中のstateのインデックス
   * null: 最新の状態を表示中（対局進行中）
   * number: 過去の状態を表示中（対局停止中・巻き戻し中）
   */
  const [viewingStateIndex, setViewingStateIndex] = useState<number | null>(null);

  const isPaused = viewingStateIndex !== null;

  // 最新のチャットメッセージがisPartialかどうかを判定
  const isChatPartial = useMemo(() => {
    if (messages.length === 0) return false;
    return messages[messages.length - 1].isPartial;
  }, [messages]);

  const boardState = useMemo<BoardState>(() => {
    const matchStates = matchStatesData?.matchStates || [];

    if (matchStates.length === 0) {
      return {
        board: createInitialBoard(),
        moveIndex: 0,
        previousBoard: null,
      };
    }

    // viewingStateIndexがnullでない場合は、指定されたインデックスの状態を表示
    // nullの場合は最新の状態を表示
    const targetIndex = viewingStateIndex ?? matchStates.length - 1;
    const currentState = matchStates[targetIndex];

    if (!currentState) {
      // インデックスが範囲外の場合は最新の状態を表示
      const lastState = matchStates[matchStates.length - 1];
      const board = sfenToBoard(lastState.sfen);
      return { board, moveIndex: lastState.index, previousBoard: null };
    }

    const board = sfenToBoard(currentState.sfen);

    // 前の局面も取得
    let previousBoard: Board | null = null;
    if (targetIndex > 0) {
      const prevState = matchStates[targetIndex - 1];
      previousBoard = sfenToBoard(prevState.sfen);
    }

    return { board, moveIndex: currentState.index, previousBoard };
  }, [matchStatesData?.matchStates, viewingStateIndex]);

  // 楽観的更新用の局面状態
  const [optimisticState, setOptimisticState] = useState<OptimisticState | null>(null);

  // 表示用の局面状態（楽観的更新を優先）
  const displayBoardState = useMemo<BoardState>(() => {
    // 巻き戻し中は常にサーバーの状態を使用
    if (viewingStateIndex !== null) {
      return boardState;
    }

    // サーバーの状態が楽観的更新に追いついたかチェック
    const serverMoveIndex = boardState.moveIndex;
    const isOptimisticValid = optimisticState && serverMoveIndex < optimisticState.moveIndex;

    // 楽観的状態が有効であればそれを使用
    if (isOptimisticValid) {
      return {
        board: optimisticState.board,
        moveIndex: optimisticState.moveIndex,
        previousBoard: boardState.board,
      };
    }

    return boardState;
  }, [boardState, optimisticState, viewingStateIndex]);

  const handleBoardChange = useCallback(
    async (newBoard: Board, usiMove: string) => {
      // 巻き戻し中は指し手を無効化
      if (viewingStateIndex !== null) {
        return;
      }

      const { board, moveIndex } = boardState;
      const nextTurn = board.turn === "SENTE" ? "GOTE" : "SENTE";
      const nextMoveIndex = moveIndex + 1;

      // 楽観的更新: 即座にUIを更新
      const optimisticBoard: Board = { ...newBoard, turn: nextTurn };
      setOptimisticState({
        board: optimisticBoard,
        moveIndex: nextMoveIndex,
      });

      // USI形式を日本語に変換（例: "7g7f" → "7六歩(7七)"）
      const japaneseMove = formatMoveToJapanese(usiMove, board);

      // チャット経由で指し手を送信
      // サーバーのAIがmoveAndEvaluateツールを呼び出して局面を更新
      await sendChatMessage({
        matchId,
        content: japaneseMove,
        aiPersonality: promptSettings.aiPersonality,
      });
    },
    [boardState, matchId, sendChatMessage, viewingStateIndex, promptSettings.aiPersonality],
  );

  // 前の局面との差分セルを計算
  const diffCells = useMemo(() => {
    if (!displayBoardState.previousBoard) {
      return [];
    }
    return calculateDiffCells(displayBoardState.previousBoard, displayBoardState.board);
  }, [displayBoardState.previousBoard, displayBoardState.board]);

  // 勝者を計算
  const winner = useMemo(() => getWinner(displayBoardState.board), [displayBoardState.board]);

  // 盤面操作を無効化するかどうか
  const isBoardDisabled = isPaused || isChatPartial || winner !== null;

  // 全ての対局状態
  const matchStates = matchStatesData?.matchStates;

  // 表示するstateのインデックスを変更
  const handleViewingIndexChange = useCallback((newIndex: number) => {
    setViewingStateIndex(newIndex);
  }, []);

  // 対局を停止
  const handlePause = useCallback(() => {
    if (!matchStates) return;
    setViewingStateIndex(matchStates.length - 1);
  }, [matchStates]);

  // 再生ボタン押下時
  const handleResumeClick = useCallback(() => {
    if (!matchStates) return;
    // 最新の状態を表示中の場合は、ダイアログを開かずにそのまま再開
    const latestIndex = matchStates.at(-1)?.index;
    if (viewingStateIndex === latestIndex) {
      setViewingStateIndex(null);
      return;
    }
    resumeDialogModal.open();
  }, [resumeDialogModal, viewingStateIndex, matchStates]);

  // 巻き戻し成功時のコールバック
  const handleRewindSuccess = useCallback(() => {
    setViewingStateIndex(null);
  }, []);

  return (
    <div className={styles.container}>
      <ResizableContainer direction="row" storageKey="matchDetailPage:chatWidth">
        <MatchChat matchId={matchId} disabled={isChatPartial} />
        <Col style={{ height: "100%", overflow: "hidden" }}>
          <StatusBar
            currentTurn={displayBoardState.board.turn}
            matchId={matchId}
            matchStateIndex={displayBoardState.moveIndex}
            isAiThinking={isChatPartial}
            thinkingTimeMs={undefined}
            winner={winner}
            isPaused={isPaused}
            viewingStateIndex={viewingStateIndex}
            totalStates={matchStates?.length ?? 0}
            onPause={handlePause}
            onResumeClick={handleResumeClick}
            onViewingIndexChange={handleViewingIndexChange}
          />
          <ShogiTable
            board={displayBoardState.board}
            onBoardChange={handleBoardChange}
            disabled={isBoardDisabled}
            diffCells={diffCells}
            className={styles.shogiTable}
          />
        </Col>
      </ResizableContainer>
      <ResumeDialog
        open={isResumeDialogOpen}
        onClose={resumeDialogModal.close}
        matchId={matchId}
        viewingIndex={viewingStateIndex ?? 0}
        onRewindSuccess={handleRewindSuccess}
      />
    </div>
  );
}
