import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 天守閣美濃の条件
 * 飛2八、玉8七、金5八・6八、銀7八
 */
const tenshukakuMinoConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.Rook, position: { row: 7, col: 7 } }, // 2八
    { piece: PieceType.King, position: { row: 6, col: 1 } }, // 8七
    { piece: PieceType.Gold, position: { row: 7, col: 4 } }, // 5八
    { piece: PieceType.Gold, position: { row: 7, col: 3 } }, // 6八
    { piece: PieceType.Silver, position: { row: 7, col: 2 } }, // 7八
  ],
};

/**
 * 盤面が天守閣美濃の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 天守閣美濃の条件を満たせばtrue
 */
export function isTenshukakuMino(board: Board, player: Player): boolean {
  return matchBoardConditions(board, tenshukakuMinoConditions, player);
}
