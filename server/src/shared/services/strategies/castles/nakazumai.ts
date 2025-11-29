import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 中住まいの条件
 * 玉5九or5八、金4九or4八
 */
const nakazumaiConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    {
      type: "or",
      conditions: [
        { piece: PieceType.King, position: { row: 8, col: 4 } }, // 5九
        { piece: PieceType.King, position: { row: 7, col: 4 } }, // 5八
      ],
    },
    {
      type: "or",
      conditions: [
        { piece: PieceType.Gold, position: { row: 8, col: 5 } }, // 4九
        { piece: PieceType.Gold, position: { row: 7, col: 5 } }, // 4八
      ],
    },
  ],
};

/**
 * 盤面が中住まいの形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 中住まいの条件を満たせばtrue
 */
export function isNakazumai(board: Board, player: Player): boolean {
  return matchBoardConditions(board, nakazumaiConditions, player);
}
