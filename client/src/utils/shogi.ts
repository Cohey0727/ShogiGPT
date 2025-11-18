import { PieceType, Player } from "../shared/consts";
import type { Board, Cell, BoardIndex } from "../shared/consts";

/**
 * USI形式の座標をBoard配列のインデックスに変換
 * USI: 1a-9i, Board: row 0-8, col 0-8
 * 例: "7g" → { row: 6, col: 6 }
 */
function usiToIndex(usi: string): { row: BoardIndex; col: BoardIndex } {
  const file = parseInt(usi[0], 10); // 筋 (1-9)
  const rank = usi[1]; // 段 (a-i)

  const col = (file - 1) as BoardIndex; // 1筋=col0, 9筋=col8
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
  const row = rankMap[rank] as BoardIndex;

  return { row, col };
}

/**
 * USI形式の指し手を盤面に適用
 * 例: "7g7f", "8h2b+", "G*5e"
 */
export function applyUsiMove(usiMove: string, board: Board): Board {
  const newCells = board.cells.map((row) => row.slice());
  const newCapturedBySente = [...board.capturedBySente];
  const newCapturedByGote = [...board.capturedByGote];

  // 駒打ちの場合（例: G*5e）
  if (usiMove.includes("*")) {
    const [pieceChar, to] = usiMove.split("*");
    const { row, col } = usiToIndex(to);

    // USI駒文字から駒タイプへの変換
    const pieceTypeMap: Record<string, PieceType> = {
      P: PieceType.Pawn,
      L: PieceType.Lance,
      N: PieceType.Knight,
      S: PieceType.Silver,
      G: PieceType.Gold,
      B: PieceType.Bishop,
      R: PieceType.Rook,
    };

    const pieceType = pieceTypeMap[pieceChar.toUpperCase()];
    if (!pieceType) {
      console.error("Unknown piece type:", pieceChar);
      return board;
    }

    // 現在の手番を判定（持ち駒から削除するため）
    const currentPlayer = board.turn;
    newCells[row][col] = { type: pieceType, player: currentPlayer };

    // 持ち駒から削除
    if (currentPlayer === Player.Sente) {
      const index = newCapturedBySente.indexOf(pieceType);
      if (index > -1) {
        newCapturedBySente.splice(index, 1);
      }
    } else {
      const index = newCapturedByGote.indexOf(pieceType);
      if (index > -1) {
        newCapturedByGote.splice(index, 1);
      }
    }

    return {
      cells: newCells,
      capturedBySente: newCapturedBySente,
      capturedByGote: newCapturedByGote,
      turn: currentPlayer === Player.Sente ? Player.Gote : Player.Sente,
    };
  }

  // 通常の移動（例: 7g7f, 8h2b+）
  const isPromotion = usiMove.endsWith("+");
  const moveWithoutPromotion = isPromotion ? usiMove.slice(0, -1) : usiMove;

  if (moveWithoutPromotion.length >= 4) {
    const from = moveWithoutPromotion.substring(0, 2);
    const to = moveWithoutPromotion.substring(2, 4);

    const fromPos = usiToIndex(from);
    const toPos = usiToIndex(to);

    const piece = newCells[fromPos.row][fromPos.col];
    if (!piece) {
      console.error("No piece at from position:", from);
      return board;
    }

    const capturedPiece = newCells[toPos.row][toPos.col];

    // 駒を移動
    newCells[fromPos.row][fromPos.col] = null;
    newCells[toPos.row][toPos.col] = piece;

    // 成りの処理
    if (isPromotion) {
      const promotedTypeMap: Record<PieceType, PieceType> = {
        [PieceType.Pawn]: PieceType.PromotedPawn,
        [PieceType.Lance]: PieceType.PromotedLance,
        [PieceType.Knight]: PieceType.PromotedKnight,
        [PieceType.Silver]: PieceType.PromotedSilver,
        [PieceType.Bishop]: PieceType.PromotedBishop,
        [PieceType.Rook]: PieceType.PromotedRook,
        // 金、玉、成駒は成れない
        [PieceType.Gold]: PieceType.Gold,
        [PieceType.King]: PieceType.King,
        [PieceType.PromotedPawn]: PieceType.PromotedPawn,
        [PieceType.PromotedLance]: PieceType.PromotedLance,
        [PieceType.PromotedKnight]: PieceType.PromotedKnight,
        [PieceType.PromotedSilver]: PieceType.PromotedSilver,
        [PieceType.PromotedBishop]: PieceType.PromotedBishop,
        [PieceType.PromotedRook]: PieceType.PromotedRook,
      };

      newCells[toPos.row][toPos.col] = {
        type: promotedTypeMap[piece.type],
        player: piece.player,
      };
    }

    // 駒を取った場合、持ち駒に追加
    if (capturedPiece) {
      // 成駒を取った場合は元の駒に戻す
      const unpromoteMap: Record<PieceType, PieceType> = {
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
        [PieceType.Gold]: PieceType.Gold,
        [PieceType.Bishop]: PieceType.Bishop,
        [PieceType.Rook]: PieceType.Rook,
        [PieceType.King]: PieceType.King,
      };

      const capturedType = unpromoteMap[capturedPiece.type];

      if (piece.player === Player.Sente) {
        newCapturedBySente.push(capturedType);
      } else {
        newCapturedByGote.push(capturedType);
      }
    }

    return {
      cells: newCells,
      capturedBySente: newCapturedBySente,
      capturedByGote: newCapturedByGote,
      turn: piece.player === Player.Sente ? Player.Gote : Player.Sente,
    };
  }

  console.error("Invalid USI move:", usiMove);
  return board;
}

/**
 * 初期盤面を生成
 */
export function createInitialBoard(): Board {
  // 空の盤面を作成
  const cells: Cell[][] = Array(9)
    .fill(null)
    .map(() => Array(9).fill(null));

  // 後手の駒を配置（上側、0行目から）
  // 一段目（0行目）
  cells[0][0] = { type: PieceType.Lance, player: Player.Gote };
  cells[0][1] = { type: PieceType.Knight, player: Player.Gote };
  cells[0][2] = { type: PieceType.Silver, player: Player.Gote };
  cells[0][3] = { type: PieceType.Gold, player: Player.Gote };
  cells[0][4] = { type: PieceType.King, player: Player.Gote };
  cells[0][5] = { type: PieceType.Gold, player: Player.Gote };
  cells[0][6] = { type: PieceType.Silver, player: Player.Gote };
  cells[0][7] = { type: PieceType.Knight, player: Player.Gote };
  cells[0][8] = { type: PieceType.Lance, player: Player.Gote };

  // 二段目（1行目）
  cells[1][1] = { type: PieceType.Rook, player: Player.Gote };
  cells[1][7] = { type: PieceType.Bishop, player: Player.Gote };

  // 三段目（2行目）- 歩
  for (let col = 0; col < 9; col++) {
    cells[2][col] = { type: PieceType.Pawn, player: Player.Gote };
  }

  // 先手の駒を配置（下側、8行目から）
  // 七段目（6行目）- 歩
  for (let col = 0; col < 9; col++) {
    cells[6][col] = { type: PieceType.Pawn, player: Player.Sente };
  }

  // 八段目（7行目）
  cells[7][1] = { type: PieceType.Bishop, player: Player.Sente };
  cells[7][7] = { type: PieceType.Rook, player: Player.Sente };

  // 九段目（8行目）
  cells[8][0] = { type: PieceType.Lance, player: Player.Sente };
  cells[8][1] = { type: PieceType.Knight, player: Player.Sente };
  cells[8][2] = { type: PieceType.Silver, player: Player.Sente };
  cells[8][3] = { type: PieceType.Gold, player: Player.Sente };
  cells[8][4] = { type: PieceType.King, player: Player.Sente };
  cells[8][5] = { type: PieceType.Gold, player: Player.Sente };
  cells[8][6] = { type: PieceType.Silver, player: Player.Sente };
  cells[8][7] = { type: PieceType.Knight, player: Player.Sente };
  cells[8][8] = { type: PieceType.Lance, player: Player.Sente };

  return {
    cells,
    capturedBySente: [],
    capturedByGote: [],
    turn: Player.Sente,
  };
}
