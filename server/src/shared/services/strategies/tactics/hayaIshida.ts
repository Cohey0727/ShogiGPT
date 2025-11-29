import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 早石田の条件
 * 先手: 飛7六（序盤）
 * 後手: 飛3四（序盤）
 *
 * 注: 序盤かどうかは手数で判断する必要があるが、
 * ここでは飛車位置のみで判定
 */
const hayaIshidaConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [
      { type: PieceType.Rook, position: { row: 5, col: 2 } }, // 7六
    ],
  },
];

/**
 * 盤面が早石田の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 早石田の条件を満たせばtrue
 */
export function isHayaIshida(board: Board, player: Player): boolean {
  return matchBoardConditions(board, hayaIshidaConditions, player);
}
