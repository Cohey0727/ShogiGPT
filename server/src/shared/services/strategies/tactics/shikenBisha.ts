import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 四間飛車の条件
 * 先手: 飛6八、角7七、銀7八
 * 後手: 飛4二、角3三、銀3二
 */
const shikenbishaConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [
      { type: PieceType.Rook, position: { row: 7, col: 3 } }, // 6八
      { type: PieceType.Bishop, position: { row: 6, col: 2 } }, // 7七
      { type: PieceType.Silver, position: { row: 7, col: 2 } }, // 7八
    ],
  },
];

/**
 * 盤面が四間飛車の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 四間飛車の条件を満たせばtrue
 */
export function isShikenBisha(board: Board, player: Player): boolean {
  return matchBoardConditions(board, shikenbishaConditions, player);
}
