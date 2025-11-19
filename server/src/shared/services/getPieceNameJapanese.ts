/**
 * USI形式の駒名を日本語に変換
 */
export function getPieceNameJapanese(usiPiece: string): string {
  const pieceMap: { [key: string]: string } = {
    P: "歩",
    L: "香",
    N: "桂",
    S: "銀",
    G: "金",
    B: "角",
    R: "飛",
    K: "玉",
    p: "歩",
    l: "香",
    n: "桂",
    s: "銀",
    g: "金",
    b: "角",
    r: "飛",
    k: "玉",
  };

  return pieceMap[usiPiece] || usiPiece;
}
