import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";

/**
 * 振り飛車穴熊の条件
 * 玉1九、金2八・3九、銀2八、香1八
 *
 * 注: README.mdでは金2八・3九、銀2八となっているが、
 * 金と銀が同じ2八にいることは不可能なので、銀2九と解釈
 */
const furibishaAnagumaConditions: PieceConditionSet[] = [
  {
    type: "and",
    conditions: [
      { piece: PieceType.King, position: { row: 8, col: 8 } }, // 1九
      { piece: PieceType.Gold, position: { row: 7, col: 7 } }, // 2八
      { piece: PieceType.Gold, position: { row: 8, col: 6 } }, // 3九
      { piece: PieceType.Silver, position: { row: 8, col: 7 } }, // 2九
      { piece: PieceType.Lance, position: { row: 7, col: 8 } }, // 1八
    ],
  },
];

/**
 * 盤面が振り飛車穴熊の形かどうかを判定
 *
 * @param board - 盤面
 * @param player - 判定対象のプレイヤー
 * @returns 振り飛車穴熊の条件を満たせばtrue
 */
export function isFuribishaAnaguma(board: Board, player: Player): boolean {
  return matchBoardConditions(board, furibishaAnagumaConditions, player);
}
