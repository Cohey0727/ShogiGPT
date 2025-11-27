import type { Cell, PieceType } from "../consts";
import { Player, pieceProperties } from "../consts";
import { sfenToBoard } from "./sfenToBoard";

/**
 * セルをASCII表記に変換する
 * @param cell セル
 * @returns ASCII表記（3文字）
 */
function cellToAscii(cell: Cell): string {
  if (cell === null) {
    return "  ・";
  }

  const prefix = cell.player === Player.Sente ? "先" : "後";
  const piece = pieceProperties[cell.type].shortName;
  return prefix + piece;
}

/**
 * 持ち駒をASCII表記に変換する
 * @param pieces 持ち駒の配列
 * @returns ASCII表記
 */
function handToAscii(pieces: PieceType[]): string {
  if (pieces.length === 0) {
    return "なし";
  }

  // 駒の種類ごとにカウント
  const counts = new Map<PieceType, number>();
  for (const piece of pieces) {
    counts.set(piece, (counts.get(piece) || 0) + 1);
  }

  const result: string[] = [];
  for (const [pieceType, count] of counts) {
    const pieceName = pieceProperties[pieceType].shortName;
    if (count === 1) {
      result.push(pieceName);
    } else {
      result.push(`${pieceName}${count}`);
    }
  }

  return result.join("、");
}

/**
 * SFEN形式の文字列をASCII盤面に変換する
 * @param sfen SFEN形式の文字列
 * @returns ASCII盤面の文字列
 */
export function sfenToAscii(sfen: string): string {
  const board = sfenToBoard(sfen);
  const lines: string[] = [];

  // ヘッダー（列番号）
  lines.push("   9    8    7    6    5    4    3    2    1");
  lines.push("+-----------------------------------------------+");

  // 各行の盤面
  const rowLabels = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
  for (let row = 0; row < 9; row++) {
    const cells = board.cells[row];
    const cellStrings = cells.map(cellToAscii);
    lines.push(`|${cellStrings.join(" ")}| ${rowLabels[row]}`);
  }

  lines.push("+-----------------------------------------------+");
  lines.push("");

  // 手番
  const turnText = board.turn === Player.Sente ? "先手" : "後手";
  lines.push(`手番: ${turnText}`);

  // 持ち駒
  const senteHand = handToAscii(board.senteHands);
  const goteHand = handToAscii(board.goteHands);
  lines.push(`持ち駒: 先手=${senteHand} / 後手=${goteHand}`);
  lines.push("");

  return lines.join("\n");
}
