import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 三間飛車の条件
 * 先手: 飛7八
 * 後手: 飛3二
 */
const sankenbishaConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [{ type: PieceType.Rook, position: { row: 7, col: 2 } }], // 7八
  },
];

/**
 * 盤面が三間飛車の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 三間飛車の条件を満たせばtrue
 */
export function isSankenBisha(board: Board, player: Player): boolean {
  return matchBoardConditions(board, sankenbishaConditions, player);
}
