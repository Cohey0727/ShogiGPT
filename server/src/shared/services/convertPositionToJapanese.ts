/**
 * USI形式の座標を日本語形式に変換
 * 例: "7g" → "7七", "5e" → "5五"
 */
export function convertPositionToJapanese(position: string): string {
  if (position.length !== 2) return position;

  const file = position[0]; // 筋（1-9）
  const rank = position[1]; // 段（a-i）

  const rankMap: { [key: string]: string } = {
    a: "一",
    b: "二",
    c: "三",
    d: "四",
    e: "五",
    f: "六",
    g: "七",
    h: "八",
    i: "九",
  };

  const rankJp = rankMap[rank] || rank;
  return `${file}${rankJp}`;
}
