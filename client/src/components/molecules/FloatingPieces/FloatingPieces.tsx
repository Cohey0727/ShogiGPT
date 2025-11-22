import "@google/model-viewer";
import { useState, createElement } from "react";
import styles from "./FloatingPieces.css";

interface Piece {
  id: number;
  model: string;
  x: number;
  duration: number;
  delay: number;
  rotate: number;
}

const PIECE_MODELS = [
  "/assets/3d/歩.glb",
  "/assets/3d/香.glb",
  "/assets/3d/桂.glb",
  "/assets/3d/銀.glb",
  "/assets/3d/金.glb",
  "/assets/3d/角.glb",
  "/assets/3d/飛.glb",
  "/assets/3d/玉.glb",
];

const PIECE_COUNT = 12;

/**
 * ランダムに配置された3D将棋駒を生成します
 */
function generatePieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, (_, i) => ({
    id: i,
    model: PIECE_MODELS[Math.floor(Math.random() * PIECE_MODELS.length)],
    x: Math.random() * 100,
    duration: 15 + Math.random() * 15, // 15-30秒
    delay: Math.random() * 5, // 0-5秒の遅延
    rotate: Math.random() * 360,
  }));
}

/**
 * HomePageの背景に3D将棋駒をランダムに飛び交わせる演出コンポーネント
 */
export function FloatingPieces() {
  const [pieces] = useState<Piece[]>(() => generatePieces());

  return (
    <div className={styles.container}>
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className={styles.pieceWrapper}
          style={{
            left: `${piece.x}%`,
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
          }}
        >
          {createElement("model-viewer", {
            src: piece.model,
            alt: "将棋の駒",
            "auto-rotate": true,
            "disable-zoom": true,
            "disable-pan": true,
            style: {
              width: "8rem",
              height: "8rem",
              transform: `rotate(${piece.rotate}deg)`,
            },
          })}
        </div>
      ))}
    </div>
  );
}
