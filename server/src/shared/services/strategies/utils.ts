import type { Board, Player, Position } from "../../consts/shogi";
import { PieceType, Player as PlayerValue } from "../../consts/shogi";
import type { PieceConditionSet } from "./matchBoardConditions";
import { matchBoardConditions } from "./matchBoardConditions";

/**
 * 指し手の表記（筋・段）を盤面座標に変換する
 *
 * 例: toPosition(7, 6) => 7六の座標
 */
export const toPosition = (file: number, rank: number): Position => ({
  row: (rank - 1) as Position["row"],
  col: (9 - file) as Position["col"],
});

/**
 * プレイヤーに合わせて座標を反転
 */
export const transformPosition = (position: Position, player: Player): Position =>
  player === PlayerValue.Sente
    ? position
    : {
        row: (8 - position.row) as Position["row"],
        col: (8 - position.col) as Position["col"],
      };

/**
 * 盤上に指定した駒が存在するかどうか
 */
export function hasPieceOnBoard(board: Board, pieceType: PieceType, player?: Player): boolean {
  return board.cells.some((row) =>
    row.some((cell) => cell && cell.type === pieceType && (player ? cell.player === player : true)),
  );
}

/**
 * 盤上に指定した駒が存在しないかどうか
 */
export function hasNoPieceOnBoard(board: Board, pieceType: PieceType, player?: Player): boolean {
  return !hasPieceOnBoard(board, pieceType, player);
}

/**
 * 指定位置に指定した駒があるかどうか
 */
export function hasPieceAtPosition(
  board: Board,
  position: Position,
  pieceType: PieceType,
  player?: Player,
): boolean {
  const pos = player ? transformPosition(position, player) : position;
  const cell = board.cells[pos.row]?.[pos.col];
  if (!cell) return false;
  if (player && cell.player !== player) return false;
  return cell.type === pieceType;
}

/**
 * 指定位置が空かどうか
 */
export function isSquareEmpty(board: Board, position: Position, player?: Player): boolean {
  const pos = player ? transformPosition(position, player) : position;
  return !board.cells[pos.row]?.[pos.col];
}

/**
 * 両者の条件をまとめて判定するユーティリティ
 */
export function matchForBothPlayers(
  board: Board,
  senteConditions: PieceConditionSet[],
  goteConditions: PieceConditionSet[],
): boolean {
  return (
    matchBoardConditions(board, senteConditions, PlayerValue.Sente) &&
    matchBoardConditions(board, goteConditions, PlayerValue.Gote)
  );
}

/**
 * 盤上に角・馬が存在しない（角交換済み）
 */
export function noBishopsOnBoard(board: Board): boolean {
  return (
    hasNoPieceOnBoard(board, PieceType.Bishop) &&
    hasNoPieceOnBoard(board, PieceType.PromotedBishop)
  );
}

/**
 * 両者ともに角が盤上に残っている（角未交換）
 */
export function bishopsOnBoardForBoth(board: Board): boolean {
  return (
    hasPieceOnBoard(board, PieceType.Bishop, PlayerValue.Sente) &&
    hasPieceOnBoard(board, PieceType.Bishop, PlayerValue.Gote)
  );
}
