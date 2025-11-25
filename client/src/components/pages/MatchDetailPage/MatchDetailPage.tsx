import { useParams } from "wouter";
import { useState, useCallback, useMemo } from "react";
import { ShogiBoard, MatchChat, PieceStand, StatusBar } from "../../organisms";
import {
  useGetMatchQuery,
  useSubscribeMatchStatesSubscription,
  useInsertMatchStateMutation,
  useEvaluateMatchStateMutation,
  useSubscribeChatMessagesSubscription,
} from "../../../generated/graphql/types";
import styles from "./MatchDetailPage.css";
import type { Board, PieceType } from "../../../shared/consts";
import {
  sfenToBoard,
  boardToSfen,
  createInitialBoard,
  calculateDiffCells,
  getWinner,
} from "../../../shared/services";
import { Col, Row, ResizableContainer } from "../../atoms";

interface BoardState {
  board: Board;
  moveIndex: number;
  previousBoard: Board | null;
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

  // ChatMessagesをSubscriptionで監視（isPartialチェック用）
  const [{ data: chatMessagesData }] = useSubscribeChatMessagesSubscription({
    variables: { matchId },
    pause: !matchId,
  });

  const [, insertMatchState] = useInsertMatchStateMutation();
  const [, evaluateMatchState] = useEvaluateMatchStateMutation();

  if (!match) {
    throw new Error("Match not found");
  }

  /**
   * 現在表示中のstateのインデックス
   * null: 最新の状態を表示中（対局進行中）
   * number: 過去の状態を表示中（対局停止中・巻き戻し中）
   */
  const [viewingStateIndex, setViewingStateIndex] = useState<number | null>(
    null
  );

  const isPaused = viewingStateIndex !== null;

  // 最新のチャットメッセージがisPartialかどうかを判定
  const isChatPartial = useMemo(() => {
    const messages = chatMessagesData?.chatMessages || [];
    if (messages.length === 0) return false;
    return messages[messages.length - 1].isPartial;
  }, [chatMessagesData?.chatMessages]);

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

    // 前の盤面も取得
    let previousBoard: Board | null = null;
    if (targetIndex > 0) {
      const prevState = matchStates[targetIndex - 1];
      previousBoard = sfenToBoard(prevState.sfen);
    }

    return { board, moveIndex: currentState.index, previousBoard };
  }, [matchStatesData?.matchStates, viewingStateIndex]);

  const [selectedHandPiece, setSelectedHandPiece] = useState<PieceType | null>(
    null
  );
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiThinkingTimeMs, setAiThinkingTimeMs] = useState<
    number | undefined
  >();

  const handleBoardChange = useCallback(
    async (newBoard: Board, usiMove: string) => {
      // 巻き戻し中は指し手を無効化
      if (viewingStateIndex !== null) {
        return;
      }

      const { moveIndex, board } = boardState;
      const nextTurn: "SENTE" | "GOTE" =
        board.turn === "SENTE" ? "GOTE" : "SENTE";
      const nextMoveIndex = moveIndex + 1;
      const updatedBoard = { ...newBoard, turn: nextTurn };

      // 盤面をSFEN形式に変換
      const newSfen = boardToSfen(updatedBoard);

      // MatchStateを保存（Subscriptionで自動的にUIが更新される）
      const result = await insertMatchState({
        matchState: {
          matchId,
          index: nextMoveIndex,
          usiMove,
          sfen: newSfen,
          thinkingTime: null,
        },
      });

      // 次の手番がAIかどうかを判定
      const isAiTurn =
        nextTurn === "SENTE"
          ? match.senteType === "AI"
          : match.goteType === "AI";

      const newMatchState = result.data?.insertMatchStatesOne;
      if (isAiTurn && newMatchState) {
        // AIが思考中であることを示す
        setIsAiThinking(true);
        setAiThinkingTimeMs(undefined);

        try {
          // 保存したMatchStateのmatchIdとindexを使ってAI評価を実行
          // applyBestMove: trueを指定することで、サーバー側で最善手を盤面に反映
          const evaluationResponse = await evaluateMatchState({
            input: {
              matchId: newMatchState.matchId,
              index: newMatchState.index,
              applyBestMove: true,
            },
          });
          const evaluation = evaluationResponse.data?.evaluateMatchState;
          // 思考時間を設定
          if (evaluation?.timeMs) {
            setAiThinkingTimeMs(evaluation.timeMs);
          }
        } finally {
          // AIの思考が終了
          setIsAiThinking(false);
        }
      }
    },
    [
      boardState,
      match,
      matchId,
      insertMatchState,
      evaluateMatchState,
      viewingStateIndex,
    ]
  );

  // 前の盤面との差分セルを計算
  const diffCells = useMemo(() => {
    if (!boardState.previousBoard) {
      return [];
    }
    return calculateDiffCells(boardState.previousBoard, boardState.board);
  }, [boardState.previousBoard, boardState.board]);

  // 勝者を計算
  const winner = useMemo(() => getWinner(boardState.board), [boardState.board]);

  // 全ての対局状態
  const matchStates = matchStatesData?.matchStates || [];

  // 表示するstateのインデックスを変更
  const handleViewingIndexChange = useCallback((newIndex: number) => {
    setViewingStateIndex(newIndex);
  }, []);

  // 対局を停止
  const handlePause = useCallback(() => {
    setViewingStateIndex(matchStates.length - 1);
  }, [matchStates.length]);

  // 対局を再開
  const handleResume = useCallback(() => {
    setViewingStateIndex(null);
  }, []);

  return (
    <div className={styles.container}>
      <ResizableContainer
        direction="row"
        storageKey="matchDetailPage:chatWidth"
      >
        <MatchChat matchId={matchId} disabled={isChatPartial} />
        <Col style={{ height: "100%", overflow: "hidden" }}>
          <StatusBar
            currentTurn={boardState.board.turn}
            matchStateIndex={boardState.moveIndex}
            isAiThinking={isAiThinking}
            thinkingTimeMs={aiThinkingTimeMs}
            winner={winner}
            isPaused={isPaused}
            viewingStateIndex={viewingStateIndex}
            totalStates={matchStates.length}
            onPause={handlePause}
            onResume={handleResume}
            onViewingIndexChange={handleViewingIndexChange}
          />
          <Row className={styles.boardSection} align="center" justify="center">
            <div className={styles.gotePieceStand}>
              <PieceStand
                player="GOTE"
                pieces={boardState.board.goteHands}
                selectedPieceType={
                  boardState.board.turn === "GOTE" ? selectedHandPiece : null
                }
                onPieceSelect={(pieceType) => {
                  if (boardState.board.turn === "GOTE") {
                    setSelectedHandPiece(pieceType);
                  }
                }}
                disabled={isAiThinking || isPaused || isChatPartial}
              />
            </div>
            <div className={styles.boardContainer}>
              <ShogiBoard
                board={boardState.board}
                currentPlayer={boardState.board.turn}
                onBoardChange={handleBoardChange}
                selectedHandPiece={selectedHandPiece}
                onHandPieceDeselect={() => setSelectedHandPiece(null)}
                disabled={isAiThinking || isPaused || isChatPartial}
                diffCells={diffCells}
              />
            </div>
            <div className={styles.sentePieceStand}>
              <PieceStand
                player="SENTE"
                pieces={boardState.board.senteHands}
                selectedPieceType={
                  boardState.board.turn === "SENTE" ? selectedHandPiece : null
                }
                onPieceSelect={(pieceType) => {
                  if (boardState.board.turn === "SENTE") {
                    setSelectedHandPiece(pieceType);
                  }
                }}
                disabled={isAiThinking || isPaused || isChatPartial}
              />
            </div>
          </Row>
        </Col>
      </ResizableContainer>
    </div>
  );
}
