import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 木村美濃の条件
 * 玉2八、金3八・5七、銀4六
 */
const kimuraMinoConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.King, position: { row: 7, col: 7 } }, // 2八
    { piece: PieceType.Gold, position: { row: 7, col: 6 } }, // 3八
    { piece: PieceType.Gold, position: { row: 6, col: 4 } }, // 5七
    { piece: PieceType.Silver, position: { row: 5, col: 5 } }, // 4六
  ],
};

/**
 * 盤面が木村美濃の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 木村美濃の条件を満たせばtrue
 */
export function isKimuraMino(board: Board, player: Player): boolean {
  return matchBoardConditions(board, kimuraMinoConditions, player);
}
