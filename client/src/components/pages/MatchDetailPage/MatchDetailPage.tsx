import { useParams } from "wouter";
import { useState, useCallback, useMemo } from "react";
import { ShogiBoard, MatchChat, PieceStand } from "../../organisms";
import {
  useGetMatchQuery,
  useInsertMatchStateMutation,
  useEvaluateMatchStateMutation,
} from "../../../generated/graphql/types";
import styles from "./MatchDetailPage.css";
import { createInitialBoard } from "../../../utils/shogi";
import type { Board } from "../../../shared/consts";
import { sfenToBoard, boardToSfen, applyUsiMove } from "../../../shared/services";

interface BoardState {
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

  const [, insertMatchState] = useInsertMatchStateMutation();
  const [, evaluateMatchState] = useEvaluateMatchStateMutation();

  if (!match) {
    throw new Error("Match not found");
  }

  // matchStatesから最新の盤面を計算
  const initialBoardState = useMemo(() => {
    const matchStates = match.matchStates || [];

    if (matchStates.length === 0) {
      return {
        board: createInitialBoard(),
        currentTurn: "SENTE" as const,
        moveIndex: 0,
      };
    }

    // 最新のmatchStateのSFENから盤面を作成
    const lastState = matchStates[matchStates.length - 1];
    const board = sfenToBoard(lastState.sfen);

    return { board, moveIndex: matchStates.length };
  }, [match.matchStates]);

  const [boardState, setBoardState] = useState<BoardState>(initialBoardState);

  const handleBoardChange = useCallback(
    async (newBoard: Board) => {
      const { moveIndex } = boardState;
      const nextTurn: "SENTE" | "GOTE" =
        boardState.board.turn === "SENTE" ? "GOTE" : "SENTE";
      const nextMoveIndex = moveIndex + 1;
      const updatedBoard = { ...newBoard, turn: nextTurn };
      setBoardState({
        board: updatedBoard,
        moveIndex: nextMoveIndex,
      });

      // 盤面をSFEN形式に変換
      const newSfen = boardToSfen(newBoard);

      // MatchStateを保存（AIでも人間でも常に保存）
      const result = await insertMatchState({
        matchId,
        index: nextMoveIndex,
        moveNotation: null,
        player: nextTurn,
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
        // 保存したMatchStateのmatchIdとindexを使ってAI評価を実行
        const evaluationResponse = await evaluateMatchState({
          input: { matchId: newMatchState.matchId, index: newMatchState.index },
        });
        const evaluation = evaluationResponse.data?.evaluateMatchState;
        console.log("AI Evaluation:", evaluation);

        // AIの最善手を盤面に反映
        if (evaluation?.bestmove) {
          try {
            const newBoardWithAiMove = applyUsiMove(updatedBoard, evaluation.bestmove);
            const nextNextTurn: "SENTE" | "GOTE" =
              nextTurn === "SENTE" ? "GOTE" : "SENTE";
            const aiMoveIndex = nextMoveIndex + 1;

            setBoardState({
              board: newBoardWithAiMove,
              moveIndex: aiMoveIndex,
            });

            // AIの指し手もMatchStateに保存
            const aiSfen = boardToSfen(newBoardWithAiMove);
            await insertMatchState({
              matchId,
              index: aiMoveIndex,
              moveNotation: evaluation.bestmove,
              player: nextNextTurn,
              sfen: aiSfen,
              thinkingTime: evaluation.timeMs,
            });
          } catch (error) {
            console.error("Failed to apply AI move:", error);
          }
        }
      }
    },
    [boardState, match, matchId, insertMatchState, evaluateMatchState]
  );

  console.log({ boardState });

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.chatSection}>
          <MatchChat matchId={matchId} />
        </div>

        <div className={styles.boardSection}>
          <div className={styles.gotePieceStand}>
            <PieceStand
              player="GOTE"
              pieces={boardState.board.capturedByGote}
            />
          </div>
          <ShogiBoard
            board={boardState.board}
            currentPlayer={boardState.board.turn}
            onBoardChange={handleBoardChange}
          />
          <div className={styles.sentePieceStand}>
            <PieceStand
              player="SENTE"
              pieces={boardState.board.capturedBySente}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
