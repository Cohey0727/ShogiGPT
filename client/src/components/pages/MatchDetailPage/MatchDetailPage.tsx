import { useParams } from "wouter";
import { useState, useCallback, useMemo } from "react";
import { ShogiBoard, MatchChat, PieceStand } from "../../organisms";
import {
  useGetMatchQuery,
  useEvaluateMatchStateMutation,
} from "../../../generated/graphql/types";
import styles from "./MatchDetailPage.css";
import { createInitialBoard } from "../../../utils/shogi";
import type { Board } from "../../../shared/consts";
import { Player } from "../../../shared/consts";
import { sfenToBoard, boardToSfen } from "../../../shared/services";

interface BoardState {
  board: Board;
  currentTurn: "SENTE" | "GOTE";
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
    const currentTurn = board.turn === Player.Sente ? "SENTE" : "GOTE";

    return {
      board,
      currentTurn: currentTurn as "SENTE" | "GOTE",
      moveIndex: matchStates.length,
    };
  }, [match.matchStates]);

  const [boardState, setBoardState] = useState<BoardState>(initialBoardState);

  const handleBoardChange = useCallback(
    async (newBoard: Board) => {
      const { currentTurn, moveIndex } = boardState;
      const nextTurn: "SENTE" | "GOTE" =
        currentTurn === "SENTE" ? "GOTE" : "SENTE";
      const nextMoveIndex = moveIndex + 1;

      setBoardState({
        board: newBoard,
        currentTurn: nextTurn,
        moveIndex: nextMoveIndex,
      });

      // 次の手番がAIかどうかを判定
      const isAiTurn =
        nextTurn === "SENTE"
          ? match.senteType === "AI"
          : match.goteType === "AI";

      if (isAiTurn) {
        // 盤面をSFEN形式に変換
        const sfen = boardToSfen(newBoard);

        // AIの盤面評価を実行（デフォルト値はサーバー側で設定される）
        await evaluateMatchState({
          input: {
            matchId,
            index: nextMoveIndex,
            moveNotation: null,
            player: nextTurn,
            sfen,
          },
        });
      }
    },
    [boardState, match, matchId, evaluateMatchState]
  );

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
            currentPlayer={boardState.currentTurn}
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
