export * from "./matchBoardConditions";
export * from "./castles";
export * from "./types";

import type { Strategy } from "./types";
import * as tacticsModule from "./tactics";

/**
 * すべての戦法
 */
export const tactics: Strategy[] = [
  tacticsModule.ibisha,
  tacticsModule.mukaibisha,
  tacticsModule.sankenBisha,
  tacticsModule.shikenBisha,
  tacticsModule.nakabisha,
  tacticsModule.migiShikenBisha,
  tacticsModule.gokigenNakabisha,
  tacticsModule.bogin,
  tacticsModule.hayakuriGin,
  tacticsModule.koshikakeGin,
];
