import type { Board, Cell } from "../consts";
import { PieceType } from "../consts";

/**
 * USI形式の駒表記から駒の種類へのマッピング
 */
const USI_TO_PIECE_TYPE: Record<string, PieceType> = {
  K: PieceType.King,
  R: PieceType.Rook,
  B: PieceType.Bishop,
  G: PieceType.Gold,
  S: PieceType.Silver,
  N: PieceType.Knight,
  L: PieceType.Lance,
  P: PieceType.Pawn,
};

/**
 * USI形式の指し手を盤面に適用する
 * @param board 現在の盤面
 * @param usiMove USI形式の指し手（例: "7g7f", "G*5e", "8h2b+"）
 * @returns 指し手を適用した新しい盤面
 */
export function applyUsiMove(board: Board, usiMove: string): Board {
  // 盤面をディープコピー
  const newCells: Cell[][] = board.cells.map((row) => [...row]);
  const newCapturedBySente = [...board.senteHands];
  const newCapturedByGote = [...board.goteHands];

  // 駒打ちの場合（例: G*5e）
  if (usiMove.includes("*")) {
    const [pieceChar, toPos] = usiMove.split("*");
    const pieceType = USI_TO_PIECE_TYPE[pieceChar];

    if (!pieceType) {
      throw new Error(`Invalid piece type in USI move: ${pieceChar}`);
    }

    const { row: toRow, col: toCol } = parsePosition(toPos);

    // 持ち駒から削除
    const capturedPieces = board.turn === "SENTE" ? newCapturedBySente : newCapturedByGote;
    const pieceIndex = capturedPieces.indexOf(pieceType);

    if (pieceIndex === -1) {
      throw new Error(`Piece not found in hand: ${pieceType}`);
    }

    capturedPieces.splice(pieceIndex, 1);

    // 盤面に配置
    newCells[toRow][toCol] = {
      type: pieceType,
      player: board.turn,
    };

    return {
      cells: newCells,
      senteHands: newCapturedBySente,
      goteHands: newCapturedByGote,
      turn: board.turn === "SENTE" ? "GOTE" : "SENTE",
    };
  }

  // 通常の移動の場合（例: 7g7f, 8h2b+）
  const isPromotion = usiMove.endsWith("+");
  const moveWithoutPromotion = isPromotion ? usiMove.slice(0, -1) : usiMove;

  if (moveWithoutPromotion.length !== 4) {
    throw new Error(`Invalid USI move format: ${usiMove}`);
  }

  const fromPos = moveWithoutPromotion.substring(0, 2);
  const toPos = moveWithoutPromotion.substring(2, 4);

  const { row: fromRow, col: fromCol } = parsePosition(fromPos);
  const { row: toRow, col: toCol } = parsePosition(toPos);

  const movingPiece = newCells[fromRow][fromCol];

  if (!movingPiece) {
    throw new Error(`No piece at position ${fromPos}`);
  }

  // 移動先に駒がある場合は取る
  const capturedPiece = newCells[toRow][toCol];
  if (capturedPiece) {
    // 成り駒は元の駒に戻して持ち駒にする
    let capturedPieceType = capturedPiece.type;
    if (isPromotedPiece(capturedPieceType)) {
      capturedPieceType = demotePiece(capturedPieceType);
    }

    if (board.turn === "SENTE") {
      newCapturedBySente.push(capturedPieceType);
    } else {
      newCapturedByGote.push(capturedPieceType);
    }
  }

  // 駒を移動
  let newPiece = movingPiece;
  if (isPromotion) {
    newPiece = {
      ...movingPiece,
      type: promotePiece(movingPiece.type),
    };
  }

  newCells[toRow][toCol] = newPiece;
  newCells[fromRow][fromCol] = null;

  return {
    cells: newCells,
    senteHands: newCapturedBySente,
    goteHands: newCapturedByGote,
    turn: board.turn === "SENTE" ? "GOTE" : "SENTE",
  };
}

/**
 * USI形式の座標（例: "7g"）を行・列のインデックスに変換
 */
function parsePosition(pos: string): { row: number; col: number } {
  if (pos.length !== 2) {
    throw new Error(`Invalid position format: ${pos}`);
  }

  const file = parseInt(pos[0], 10); // 筋（1-9）
  const rank = pos[1]; // 段（a-i）

  // 筋は1-9で、盤面の配列は0-8なので、9から引く（右から左）
  const col = 9 - file;

  // 段はa-iで、盤面の配列は0-8
  const rankMap: Record<string, number> = {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    e: 4,
    f: 5,
    g: 6,
    h: 7,
    i: 8,
  };

  const row = rankMap[rank];

  if (row === undefined) {
    throw new Error(`Invalid rank in position: ${rank}`);
  }

  return { row, col };
}

/**
 * 駒を成る
 */
function promotePiece(pieceType: PieceType): PieceType {
  const promotionMap: Record<PieceType, PieceType> = {
    [PieceType.Pawn]: PieceType.PromotedPawn,
    [PieceType.Lance]: PieceType.PromotedLance,
    [PieceType.Knight]: PieceType.PromotedKnight,
    [PieceType.Silver]: PieceType.PromotedSilver,
    [PieceType.Bishop]: PieceType.PromotedBishop,
    [PieceType.Rook]: PieceType.PromotedRook,
    [PieceType.Gold]: PieceType.Gold,
    [PieceType.King]: PieceType.King,
    [PieceType.PromotedPawn]: PieceType.PromotedPawn,
    [PieceType.PromotedLance]: PieceType.PromotedLance,
    [PieceType.PromotedKnight]: PieceType.PromotedKnight,
    [PieceType.PromotedSilver]: PieceType.PromotedSilver,
    [PieceType.PromotedBishop]: PieceType.PromotedBishop,
    [PieceType.PromotedRook]: PieceType.PromotedRook,
  };

  return promotionMap[pieceType] ?? pieceType;
}

/**
 * 成り駒かどうかを判定
 */
function isPromotedPiece(pieceType: PieceType): boolean {
  const promotedPieces: PieceType[] = [
    PieceType.PromotedPawn,
    PieceType.PromotedLance,
    PieceType.PromotedKnight,
    PieceType.PromotedSilver,
    PieceType.PromotedBishop,
    PieceType.PromotedRook,
  ];
  return promotedPieces.includes(pieceType);
}

/**
 * 成り駒を元の駒に戻す
 */
function demotePiece(pieceType: PieceType): PieceType {
  const demotionMap: Record<PieceType, PieceType> = {
    [PieceType.PromotedPawn]: PieceType.Pawn,
    [PieceType.PromotedLance]: PieceType.Lance,
    [PieceType.PromotedKnight]: PieceType.Knight,
    [PieceType.PromotedSilver]: PieceType.Silver,
    [PieceType.PromotedBishop]: PieceType.Bishop,
    [PieceType.PromotedRook]: PieceType.Rook,
    [PieceType.Pawn]: PieceType.Pawn,
    [PieceType.Lance]: PieceType.Lance,
    [PieceType.Knight]: PieceType.Knight,
    [PieceType.Silver]: PieceType.Silver,
    [PieceType.Bishop]: PieceType.Bishop,
    [PieceType.Rook]: PieceType.Rook,
    [PieceType.Gold]: PieceType.Gold,
    [PieceType.King]: PieceType.King,
  };

  return demotionMap[pieceType] ?? pieceType;
}
