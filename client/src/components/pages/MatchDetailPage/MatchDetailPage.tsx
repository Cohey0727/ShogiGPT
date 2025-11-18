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
import { sfenToBoard, boardToSfen } from "../../../shared/services";

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
      const newSfen = boardToSfen(updatedBoard);

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

      if (isAiTurn && result.data?.insertMatchStatesOne) {
        // 保存したMatchStateのmatchIdとindexを使ってAI評価を実行
        await evaluateMatchState({
          input: {
            matchId: result.data.insertMatchStatesOne.matchId,
            index: result.data.insertMatchStatesOne.index,
          },
        });
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
