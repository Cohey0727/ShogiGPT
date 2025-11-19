import { convertPositionToJapanese } from "./convertPositionToJapanese";
import { getPieceNameJapanese } from "./getPieceNameJapanese";
import type { Board } from "../consts/shogi";
import { pieceProperties } from "../consts/shogi";

/**
 * USI形式の位置をBoard配列のインデックスに変換
 * 例: "7g" → { row: 6, col: 2 }
 */
function usiPositionToBoardIndex(usiPos: string): { row: number; col: number } {
  const file = parseInt(usiPos[0], 10); // 9-1
  const rank = usiPos[1]; // a-i

  const col = 9 - file; // 0-8 (左から右)
  const row = rank.charCodeAt(0) - "a".charCodeAt(0); // 0-8 (上から下)

  return { row, col };
}

/**
 * 指し手をUSI形式から日本語形式に変換（駒名付き）
 * 例: "7g7f" → "7七歩→7六", "G*5e" → "5五金打"
 */
export function formatMoveToJapanese(usiMove: string, board?: Board): string {
  // 駒打ちの場合（例: G*5e）
  if (usiMove.includes("*")) {
    const [piece, to] = usiMove.split("*");
    const pieceName = getPieceNameJapanese(piece);
    const toJp = convertPositionToJapanese(to);
    return `${toJp}${pieceName}打`;
  }

  // 通常の移動（例: 7g7f, 8h2b+）
  const isPromotion = usiMove.endsWith("+");
  const moveWithoutPromotion = isPromotion ? usiMove.slice(0, -1) : usiMove;

  if (moveWithoutPromotion.length >= 4) {
    const from = moveWithoutPromotion.substring(0, 2);
    const to = moveWithoutPromotion.substring(2, 4);
    const fromJp = convertPositionToJapanese(from);
    const toJp = convertPositionToJapanese(to);

    // 盤面情報がある場合は駒名を付ける
    let pieceName = "";
    if (board) {
      try {
        const { row, col } = usiPositionToBoardIndex(from);
        const piece = board.cells[row]?.[col];
        if (piece) {
          pieceName = pieceProperties[piece.type].name;
        }
      } catch {
        // インデックスエラーの場合は駒名なしで続行
      }
    }

    if (isPromotion) {
      return pieceName
        ? `${fromJp}${pieceName}-${toJp}成`
        : `${fromJp}-${toJp}成`;
    }
    return pieceName ? `${toJp}${pieceName}(${fromJp})` : `${toJp}(${fromJp})`;
  }

  // パースできない場合はそのまま返す
  return usiMove;
}
