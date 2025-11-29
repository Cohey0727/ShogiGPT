import type { Board, Player } from "../../../consts/shogi";
import { PieceType } from "../../../consts/shogi";
import type { PieceConditionSet } from "../matchBoardConditions";
import { matchBoardConditions } from "../matchBoardConditions";
import type { SingleStrategy } from "../types";

/**
 * 右玉の条件
 * 飛2八、玉2八、金3八、銀4八
 *
 * 注: README.mdでは飛2八、玉2八となっているが、
 * 飛と玉が同じ2八にいることは不可能なので、飛の条件は省略
 */
const migigyokuConditions: PieceConditionSet = {
  type: "and",
  conditions: [
    { piece: PieceType.King, position: { row: 7, col: 7 } }, // 2八
    { piece: PieceType.Gold, position: { row: 7, col: 6 } }, // 3八
    { piece: PieceType.Silver, position: { row: 7, col: 5 } }, // 4八
  ],
};

/**
 * 右玉
 */
export const migigyoku: SingleStrategy = {
  name: "右玉",
  type: "single",
  match: (board: Board, player: Player) => matchBoardConditions(board, migigyokuConditions, player),
  turnRange: { from: 20 },
};
