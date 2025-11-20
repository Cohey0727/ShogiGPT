import { useParams } from "wouter";
import { useState, useCallback, useMemo } from "react";
import { ShogiBoard, MatchChat, PieceStand, StatusBar } from "../../organisms";
import {
  useGetMatchQuery,
  useInsertMatchStateMutation,
  useEvaluateMatchStateMutation,
} from "../../../generated/graphql/types";
import styles from "./MatchDetailPage.css";
import type { Board, PieceType } from "../../../shared/consts";
import {
  sfenToBoard,
  boardToSfen,
  applyUsiMove,
  createInitialBoard,
  calculateDiffCells,
  getWinner,
} from "../../../shared/services";
import { Col, Row } from "../../atoms";

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

  const [, insertMatchState] = useInsertMatchStateMutation();
  const [, evaluateMatchState] = useEvaluateMatchStateMutation();

  if (!match) {
    throw new Error("Match not found");
  }

  // matchStatesから最新の盤面と前の盤面を計算
  const initialBoardState = useMemo(() => {
    const matchStates = match.matchStates || [];

    if (matchStates.length === 0) {
      return {
        board: createInitialBoard(),
        currentTurn: "SENTE" as const,
        moveIndex: 0,
        previousBoard: null,
      };
    }

    // 最新のmatchStateのSFENから盤面を作成
    const lastState = matchStates[matchStates.length - 1];
    const board = sfenToBoard(lastState.sfen);

    // 前の盤面も取得
    let previousBoard: Board | null = null;
    if (matchStates.length >= 2) {
      const prevState = matchStates[matchStates.length - 2];
      previousBoard = sfenToBoard(prevState.sfen);
    }

    return { board, moveIndex: matchStates.length, previousBoard };
  }, [match.matchStates]);

  const [boardState, setBoardState] = useState<BoardState>(initialBoardState);
  const [selectedHandPiece, setSelectedHandPiece] = useState<PieceType | null>(
    null
  );
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiThinkingTimeMs, setAiThinkingTimeMs] = useState<
    number | undefined
  >();

  const handleBoardChange = useCallback(
    async (newBoard: Board) => {
      const { moveIndex, board } = boardState;
      const nextTurn: "SENTE" | "GOTE" =
        board.turn === "SENTE" ? "GOTE" : "SENTE";
      const nextMoveIndex = moveIndex + 1;
      const updatedBoard = { ...newBoard, turn: nextTurn };
      setBoardState({
        board: updatedBoard,
        moveIndex: nextMoveIndex,
        previousBoard: board,
      });

      // 盤面をSFEN形式に変換
      const newSfen = boardToSfen(updatedBoard);

      // MatchStateを保存（AIでも人間でも常に保存）
      const result = await insertMatchState({
        matchId,
        index: nextMoveIndex,
        moveNotation: null,
        sfen: newSfen,
        thinkingTime: null,
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
          const evaluationResponse = await evaluateMatchState({
            input: {
              matchId: newMatchState.matchId,
              index: newMatchState.index,
            },
          });
          const evaluation = evaluationResponse.data?.evaluateMatchState;

          // 思考時間を設定
          if (evaluation?.timeMs) {
            setAiThinkingTimeMs(evaluation.timeMs);
          }

          // AIの最善手を盤面に反映
          if (evaluation?.bestmove) {
            try {
              const newBoardWithAiMove = applyUsiMove(
                updatedBoard,
                evaluation.bestmove
              );
              const aiMoveIndex = nextMoveIndex + 1;

              setBoardState({
                board: newBoardWithAiMove,
                moveIndex: aiMoveIndex,
                previousBoard: updatedBoard,
              });

              // AIの指し手もMatchStateに保存
              const aiSfen = boardToSfen(newBoardWithAiMove);
              await insertMatchState({
                matchId,
                index: aiMoveIndex,
                moveNotation: evaluation.bestmove,
                sfen: aiSfen,
                thinkingTime: evaluation.timeMs,
              });
            } catch (error) {
              console.error("Failed to apply AI move:", error);
            }
          }
        } finally {
          // AIの思考が終了
          setIsAiThinking(false);
        }
      }
    },
    [boardState, match, matchId, insertMatchState, evaluateMatchState]
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

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.chatSection}>
          <MatchChat matchId={matchId} />
        </div>

        <Col>
          <StatusBar
            currentTurn={boardState.board.turn}
            moveNumber={boardState.moveIndex}
            isAiThinking={isAiThinking}
            thinkingTimeMs={aiThinkingTimeMs}
            winner={winner}
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
                disabled={isAiThinking}
              />
            </div>
            <div className={styles.boardContainer}>
              <ShogiBoard
                board={boardState.board}
                currentPlayer={boardState.board.turn}
                onBoardChange={handleBoardChange}
                selectedHandPiece={selectedHandPiece}
                onHandPieceDeselect={() => setSelectedHandPiece(null)}
                disabled={isAiThinking}
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
                disabled={isAiThinking}
              />
            </div>
          </Row>
        </Col>
      </div>
    </div>
  );
}
