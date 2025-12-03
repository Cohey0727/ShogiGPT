import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";

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
 * ランダムに配置された駒を生成
 */
function generatePieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, (_, i) => ({
    id: i,
    model: PIECE_MODELS[Math.floor(Math.random() * PIECE_MODELS.length)],
    x: Math.random() * 100,
    duration: 15 + Math.random() * 15,
    delay: Math.random() * 5,
    rotate: Math.random() * 360,
  }));
}

/**
 * 背景に3D将棋駒をランダムに飛び交わせる演出コンポーネント
 */
export const FloatingPieces = component$(() => {
  const pieces = useSignal<Piece[]>([]);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    // クライアントサイドでのみ実行
    import("@google/model-viewer");
    pieces.value = generatePieces();
  });

  return (
    <div class="floating-pieces-container">
      {pieces.value.map((piece) => (
        <div
          key={piece.id}
          class="floating-piece-wrapper"
          style={{
            left: `${piece.x}%`,
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
          }}
        >
          <model-viewer
            src={piece.model}
            alt="将棋の駒"
            auto-rotate
            disable-zoom
            disable-pan
            style={{
              width: "8rem",
              height: "8rem",
              transform: `rotate(${piece.rotate}deg)`,
            }}
          />
        </div>
      ))}
    </div>
  );
});
