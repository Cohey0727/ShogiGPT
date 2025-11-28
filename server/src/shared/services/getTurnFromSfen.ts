import { Player } from "../consts";

/**
 * SFEN文字列から手番を取得する
 * @param sfen SFEN形式の文字列
 * @returns 手番（SENTE または GOTE）
 */
export function getTurnFromSfen(sfen: string): typeof Player.Sente | typeof Player.Gote {
  const parts = sfen.trim().split(/\s+/);

  if (parts.length < 2) {
    throw new Error("Invalid SFEN format: insufficient parts");
  }

  const turnPart = parts[1];
  return turnPart === "b" ? Player.Sente : Player.Gote;
}

/**
 * SFEN文字列が先手番かどうかを判定する
 * @param sfen SFEN形式の文字列
 * @returns 先手番の場合 true
 */
export function isSenteTurn(sfen: string): boolean {
  return getTurnFromSfen(sfen) === Player.Sente;
}
