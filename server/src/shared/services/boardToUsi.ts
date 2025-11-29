import type { BoardIndex, PieceType, Position } from "../consts";

/**
 * 局面の配列インデックスをUSI形式の座標に変換します
 * @param row 行インデックス（0-8）
 * @param col 列インデックス（0-8）
 * @returns USI形式の座標（例：7g、5e）
 * @example
 * positionToUsi(0, 0) // "9a"
 * positionToUsi(6, 6) // "7g"
 */
export function positionToUsi(row: BoardIndex, col: BoardIndex): string {
  // 列：0-8 → 9-1（右から左）
  const colChar = String(9 - col);
  // 行：0-8 → a-i（上から下）
  const rowChar = String.fromCharCode(97 + row); // 97 = 'a'
  return `${colChar}${rowChar}`;
}

/**
 * 駒タイプをUSI形式の文字に変換します
 * @param pieceType 駒のタイプ
 * @returns USI形式の駒文字（例：P、L、N）
 */
export function pieceTypeToUsi(pieceType: PieceType): string {
  const usiMap: Record<PieceType, string> = {
    king: "K", // 玉
    rook: "R", // 飛
    bishop: "B", // 角
    gold: "G", // 金
    silver: "S", // 銀
    knight: "N", // 桂
    lance: "L", // 香
    pawn: "P", // 歩
    promoted_rook: "+R", // 竜
    promoted_bishop: "+B", // 馬
    promoted_silver: "+S", // 成銀
    promoted_knight: "+N", // 成桂
    promoted_lance: "+L", // 成香
    promoted_pawn: "+P", // と金
  };
  return usiMap[pieceType];
}

/**
 * 駒の移動をUSI形式の指し手に変換します
 * @param from 移動元の座標
 * @param to 移動先の座標
 * @param promoted 成ったかどうか
 * @returns USI形式の指し手（例：7g7f、7g7f+）
 */
export function moveToUsi(from: Position, to: Position, promoted: boolean = false): string {
  const fromUsi = positionToUsi(from.row, from.col);
  const toUsi = positionToUsi(to.row, to.col);
  return `${fromUsi}${toUsi}${promoted ? "+" : ""}`;
}

/**
 * 持ち駒を打つ手をUSI形式の指し手に変換します
 * @param pieceType 打つ駒のタイプ
 * @param to 打つ位置
 * @returns USI形式の指し手（例：P*5e）
 */
export function dropToUsi(pieceType: PieceType, to: Position): string {
  // 持ち駒は常に成っていない駒なので、+記号を除去
  const usiPiece = pieceTypeToUsi(pieceType).replace("+", "");
  const toUsi = positionToUsi(to.row, to.col);
  return `${usiPiece}*${toUsi}`;
}
