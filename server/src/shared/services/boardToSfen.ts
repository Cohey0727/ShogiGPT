import type { Board, PieceType } from "../consts";
import { Player, PieceType as PT } from "../consts";

/**
 * SFEN形式の駒の文字マッピング
 */
const SFEN_PIECE_MAP: Record<PieceType, string> = {
  [PT.King]: "k",
  [PT.Rook]: "r",
  [PT.Bishop]: "b",
  [PT.Gold]: "g",
  [PT.Silver]: "s",
  [PT.Knight]: "n",
  [PT.Lance]: "l",
  [PT.Pawn]: "p",
  [PT.PromotedRook]: "+r",
  [PT.PromotedBishop]: "+b",
  [PT.PromotedSilver]: "+s",
  [PT.PromotedKnight]: "+n",
  [PT.PromotedLance]: "+l",
  [PT.PromotedPawn]: "+p",
};

/**
 * 局面をSFEN形式に変換する
 * @param board 局面の状態
 * @returns SFEN形式の文字列
 */
export function boardToSfen(board: Board): string {
  // 1. 局面部分
  const rows: string[] = [];
  for (let row = 0; row < 9; row++) {
    let rowStr = "";
    let emptyCount = 0;

    for (let col = 0; col < 9; col++) {
      const cell = board.cells[row][col];

      if (cell === null) {
        emptyCount++;
      } else {
        // 空きマスがあれば先に数値として追加
        if (emptyCount > 0) {
          rowStr += emptyCount.toString();
          emptyCount = 0;
        }

        // 駒を追加
        const pieceSfen = SFEN_PIECE_MAP[cell.type];
        const pieceChar =
          cell.player === Player.Sente ? pieceSfen.toUpperCase() : pieceSfen.toLowerCase();
        rowStr += pieceChar;
      }
    }

    // 行末の空きマスを追加
    if (emptyCount > 0) {
      rowStr += emptyCount.toString();
    }

    rows.push(rowStr);
  }

  const boardPart = rows.join("/");

  // 2. 手番部分
  const turnPart = board.turn === Player.Sente ? "b" : "w";

  // 3. 持ち駒部分
  const handPart = formatHand(board);

  // 4. 手数部分（常に1を返す）
  const movePart = "1";

  return `${boardPart} ${turnPart} ${handPart} ${movePart}`;
}

/**
 * 持ち駒をSFEN形式にフォーマットする
 */
function formatHand(board: Board): string {
  const pieces: string[] = [];

  // 先手の持ち駒
  const senteCounts = countPieces(board.senteHands);
  for (const [type, count] of Object.entries(senteCounts)) {
    const sfen = SFEN_PIECE_MAP[type as PieceType];
    const pieceStr = count > 1 ? `${count}${sfen}` : sfen;
    pieces.push(pieceStr.toUpperCase());
  }

  // 後手の持ち駒
  const goteCounts = countPieces(board.goteHands);
  for (const [type, count] of Object.entries(goteCounts)) {
    const sfen = SFEN_PIECE_MAP[type as PieceType];
    const pieceStr = count > 1 ? `${count}${sfen}` : sfen;
    pieces.push(pieceStr.toLowerCase());
  }

  return pieces.length > 0 ? pieces.join("") : "-";
}

/**
 * 持ち駒の枚数を駒種別にカウントする
 */
function countPieces(pieces: PieceType[]): Record<string, number> {
  const counts: Record<string, number> = {};

  // SFEN形式の順序: 飛車、角、金、銀、桂、香、歩
  const order = [PT.Rook, PT.Bishop, PT.Gold, PT.Silver, PT.Knight, PT.Lance, PT.Pawn];

  for (const piece of pieces) {
    counts[piece] = (counts[piece] || 0) + 1;
  }

  // 正しい順序でソートして返す
  const sortedCounts: Record<string, number> = {};
  for (const type of order) {
    if (counts[type]) {
      sortedCounts[type] = counts[type];
    }
  }

  return sortedCounts;
}
