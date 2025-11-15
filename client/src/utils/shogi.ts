import { Board, Cell, PieceType, Player } from "../consts/shogi";

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
