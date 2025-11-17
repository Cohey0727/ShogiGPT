import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { ShogiBoard, MatchChat, PieceStand } from "../../organisms";
import {
  useCreateMatchMutation,
  useAnalyzePositionMutation,
} from "../../../generated/graphql/types";
import styles from "./MatchDetailPage.css";
import { createInitialBoard } from "../../../utils/shogi";
import type { PieceType as PieceTypeType, Board } from "../../../shared/consts";
import { Player, boardToSfen } from "../../../shared/consts";

export function MatchDetailPage() {
  const params = useParams<{ matchId: string }>();
  const matchId = params.matchId;
  const [, setLocation] = useLocation();
  const [actualMatchId, setActualMatchId] = useState<string | null>(
    matchId === "new" ? null : matchId || null
  );
  const [, createMatch] = useCreateMatchMutation();
  const [, analyzePosition] = useAnalyzePositionMutation();

  // 盤面の状態管理（初期盤面、持ち駒は空）
  const [board, setBoard] = useState<Board>(createInitialBoard());
  // 現在のプレイヤー（先手から開始）
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.Sente);

  // PieceType[] から { [key in PieceType]?: number } への変換
  const convertCapturedPieces = (
    pieces: PieceTypeType[]
  ): { [key in PieceTypeType]?: number } => {
    const result: { [key in PieceTypeType]?: number } = {};
    for (const piece of pieces) {
      result[piece] = (result[piece] || 0) + 1;
    }
    return result;
  };

  const senteCaptured = convertCapturedPieces(board.capturedBySente);
  const goteCaptured = convertCapturedPieces(board.capturedByGote);

  // 盤面変更時にプレイヤーを交代＆AI解析
  const handleBoardChange = async (newBoard: Board) => {
    setBoard(newBoard);
    const nextPlayer =
      currentPlayer === Player.Sente ? Player.Gote : Player.Sente;
    setCurrentPlayer(nextPlayer);

    // 盤面をSFEN形式に変換
    const sfen = boardToSfen(newBoard);
    console.log("🎯 Board changed, SFEN:", sfen);

    // shogi-apiで解析
    try {
      const result = await analyzePosition({
        input: {
          sfen,
          timeMs: 1000, // 1秒思考
          multipv: 3, // 候補手3つ
        },
      });

      if (result.data?.analyzePosition) {
        const analysis = result.data.analyzePosition;
        console.log("🤖 AI Analysis Result:");
        console.log("  Best Move:", analysis.bestmove);
        console.log("  Engine:", analysis.engineName);
        console.log("  Time:", `${analysis.timeMs}ms`);
        console.log("  Variations:");
        analysis.variations.forEach((v, i) => {
          console.log(`    [${i + 1}] ${v.move}`);
          console.log(`        Score: ${v.scoreCp ?? "N/A"} cp`);
          console.log(`        Depth: ${v.depth}`);
          console.log(`        Nodes: ${v.nodes ?? "N/A"}`);
          if (v.pv && v.pv.length > 0) {
            console.log(`        PV: ${v.pv.join(" ")}`);
          }
        });
      }

      if (result.error) {
        console.error("❌ Analysis error:", result.error);
      }
    } catch (error) {
      console.error("❌ Failed to analyze position:", error);
    }
  };

  // 最初のメッセージ送信時にマッチを作成（matchIdが"new"の場合）
  const handleFirstMessage = async () => {
    if (actualMatchId) return actualMatchId; // すでにマッチが作成されている場合

    const result = await createMatch({
      playerSente: "先手",
      playerGote: "後手",
    });

    if (result.data?.insertMatchesOne) {
      const newMatchId = result.data.insertMatchesOne.id;
      setActualMatchId(newMatchId);
      // URLを置き換え
      setLocation(`/matches/${newMatchId}`, { replace: true });
      return newMatchId;
    }

    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.chatSection}>
          <MatchChat
            matchId={actualMatchId || "new"}
            onFirstMessage={matchId === "new" ? handleFirstMessage : undefined}
          />
        </div>

        <div className={styles.boardSection}>
          <div className={styles.gotePieceStand}>
            <PieceStand player="gote" capturedPieces={goteCaptured} />
          </div>
          <ShogiBoard
            board={board}
            currentPlayer={currentPlayer}
            onBoardChange={handleBoardChange}
          />
          <div className={styles.sentePieceStand}>
            <PieceStand player="sente" capturedPieces={senteCaptured} />
          </div>
        </div>
      </div>
    </div>
  );
}
