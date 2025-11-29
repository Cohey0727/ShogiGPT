import type { Board, Player } from "../../consts/shogi";

/**
 * 戦法の判定が有効な手番の範囲
 */
export interface TurnRange {
  /** 判定開始手番（この手番以降で判定する） */
  from?: number;
  /** 判定終了手番（この手番まで判定する、undefinedは終局まで） */
  to?: number;
}

/**
 * 戦法の基本定義
 */
interface StrategyBase {
  /** 戦法名（日本語） */
  name: string;
  /** 判定が有効な手番の範囲 */
  turnRange: TurnRange;
}

/**
 * 片方のプレイヤーで成立する戦法
 */
export interface SingleStrategy extends StrategyBase {
  /** 成立タイプ: 片方 */
  type: "single";
  /** 局面が条件を満たすかどうかを判定する関数 */
  match: (board: Board, player: Player) => boolean;
}

/**
 * 両者で成立する戦法
 */
export interface BothStrategy extends StrategyBase {
  /** 成立タイプ: 両者 */
  type: "both";
  /** 局面が条件を満たすかどうかを判定する関数 */
  match: (board: Board) => boolean;
}

/**
 * 戦法（Strategy）の定義
 */
export type Strategy = SingleStrategy | BothStrategy;
