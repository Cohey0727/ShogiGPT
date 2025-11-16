/**
 * プレイヤー（先手/後手）
 */
export const Player = {
  /** 先手 */
  Sente: "sente",
  /** 後手 */
  Gote: "gote",
} as const;

export type Player = (typeof Player)[keyof typeof Player];

/**
 * 駒の種類
 */
export const PieceType = {
  /** 王将/玉将 */
  King: "king",
  /** 飛車 */
  Rook: "rook",
  /** 角行 */
  Bishop: "bishop",
  /** 金将 */
  Gold: "gold",
  /** 銀将 */
  Silver: "silver",
  /** 桂馬 */
  Knight: "knight",
  /** 香車 */
  Lance: "lance",
  /** 歩兵 */
  Pawn: "pawn",
  /** 竜王 */
  PromotedRook: "promoted_rook",
  /** 竜馬 */
  PromotedBishop: "promoted_bishop",
  /** 成銀 */
  PromotedSilver: "promoted_silver",
  /** 成桂 */
  PromotedKnight: "promoted_knight",
  /** 成香 */
  PromotedLance: "promoted_lance",
  /** と金（成り歩） */
  PromotedPawn: "promoted_pawn",
} as const;

export type PieceType = (typeof PieceType)[keyof typeof PieceType];

/**
 * 駒
 */
export interface Piece {
  /** 駒の種類 */
  type: PieceType;
  /** 駒の所有者 */
  player: Player;
}

/**
 * 盤面のインデックス（0-8）
 */
export type BoardIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * 盤面の位置
 */
export interface Position {
  /** 行（0-8） */
  row: BoardIndex;
  /** 列（0-8） */
  col: BoardIndex;
}

/**
 * 盤面のセル
 */
export type Cell = Piece | null;

/**
 * 盤面
 */
export interface Board {
  /** 盤上（9x9の2次元配列） */
  cells: Cell[][];
  /** 先手の持ち駒 */
  capturedBySente: PieceType[];
  /** 後手の持ち駒 */
  capturedByGote: PieceType[];
  /** 手番 */
  turn: Player;
}

/**
 * 駒のプロパティ
 */
export interface PieceProperties {
  /** 駒の日本語表記 */
  name: string;
  /** 駒の画像ファイル名 */
  image: string;
  /** 成った後の駒（undefined = 成れない） */
  promoted?: PieceType;
  /** 成る前の駒（undefined = 成り駒ではない） */
  unpromoted?: PieceType;
}

/**
 * 各駒のプロパティ定義
 */
export const pieceProperties: Record<PieceType, PieceProperties> = {
  [PieceType.King]: {
    name: "王",
    image: "/assets/pieces/king.png",
  },
  [PieceType.Rook]: {
    name: "飛",
    image: "/assets/pieces/rook.png",
    promoted: PieceType.PromotedRook,
  },
  [PieceType.Bishop]: {
    name: "角",
    image: "/assets/pieces/bishop.png",
    promoted: PieceType.PromotedBishop,
  },
  [PieceType.Gold]: {
    name: "金",
    image: "/assets/pieces/gold.png",
  },
  [PieceType.Silver]: {
    name: "銀",
    image: "/assets/pieces/silver.png",
    promoted: PieceType.PromotedSilver,
  },
  [PieceType.Knight]: {
    name: "桂",
    image: "/assets/pieces/knight.png",
    promoted: PieceType.PromotedKnight,
  },
  [PieceType.Lance]: {
    name: "香",
    image: "/assets/pieces/lance.png",
    promoted: PieceType.PromotedLance,
  },
  [PieceType.Pawn]: {
    name: "歩",
    image: "/assets/pieces/pawn.png",
    promoted: PieceType.PromotedPawn,
  },
  [PieceType.PromotedRook]: {
    name: "竜",
    image: "/assets/pieces/promoted_rook.png",
    unpromoted: PieceType.Rook,
  },
  [PieceType.PromotedBishop]: {
    name: "馬",
    image: "/assets/pieces/promoted_bishop.png",
    unpromoted: PieceType.Bishop,
  },
  [PieceType.PromotedSilver]: {
    name: "成銀",
    image: "/assets/pieces/promoted_silver.png",
    unpromoted: PieceType.Silver,
  },
  [PieceType.PromotedKnight]: {
    name: "成桂",
    image: "/assets/pieces/promoted_knight.png",
    unpromoted: PieceType.Knight,
  },
  [PieceType.PromotedLance]: {
    name: "成香",
    image: "/assets/pieces/promoted_lance.png",
    unpromoted: PieceType.Lance,
  },
  [PieceType.PromotedPawn]: {
    name: "と",
    image: "/assets/pieces/promoted_pawn.png",
    unpromoted: PieceType.Pawn,
  },
};

/**
 * SFEN表記で使用する駒の文字マッピング
 */
const SFEN_PIECE_MAP: Record<PieceType, string> = {
  [PieceType.King]: "k",
  [PieceType.Rook]: "r",
  [PieceType.Bishop]: "b",
  [PieceType.Gold]: "g",
  [PieceType.Silver]: "s",
  [PieceType.Knight]: "n",
  [PieceType.Lance]: "l",
  [PieceType.Pawn]: "p",
  [PieceType.PromotedRook]: "+r",
  [PieceType.PromotedBishop]: "+b",
  [PieceType.PromotedSilver]: "+s",
  [PieceType.PromotedKnight]: "+n",
  [PieceType.PromotedLance]: "+l",
  [PieceType.PromotedPawn]: "+p",
};

/**
 * SFEN文字から駒タイプへの逆マッピング
 */
const SFEN_TO_PIECE_TYPE: Record<string, PieceType> = Object.entries(
  SFEN_PIECE_MAP
).reduce(
  (acc, [type, sfen]) => {
    acc[sfen] = type as PieceType;
    return acc;
  },
  {} as Record<string, PieceType>
);

/**
 * 盤面をSFEN形式の文字列に変換
 * @param board 盤面データ
 * @returns SFEN形式の文字列
 */
export function boardToSfen(board: Board): string {
  // 1. 盤面部分
  const rows: string[] = [];
  for (let row = 0; row < 9; row++) {
    let rowStr = "";
    let emptyCount = 0;

    for (let col = 0; col < 9; col++) {
      const cell = board.cells[row][col];

      if (cell === null) {
        emptyCount++;
      } else {
        // 空きマスがあればその数を追加
        if (emptyCount > 0) {
          rowStr += emptyCount.toString();
          emptyCount = 0;
        }

        // 駒を追加
        const pieceSfen = SFEN_PIECE_MAP[cell.type];
        const pieceChar =
          cell.player === Player.Sente
            ? pieceSfen.toUpperCase()
            : pieceSfen.toLowerCase();
        rowStr += pieceChar;
      }
    }

    // 行末の空きマスを追加
    if (emptyCount > 0) {
      rowStr += emptyCount.toString();
    }

    rows.push(rowStr);
  }

  const boardPart = rows.join("/");

  // 2. 手番部分
  const turnPart = board.turn === Player.Sente ? "b" : "w";

  // 3. 持ち駒部分
  const handPart = formatHand(board);

  // 4. 手数部分（デフォルトは1）
  const movePart = "1";

  return `${boardPart} ${turnPart} ${handPart} ${movePart}`;
}

/**
 * 持ち駒をSFEN形式にフォーマット
 */
function formatHand(board: Board): string {
  const pieces: string[] = [];

  // 先手の持ち駒
  const senteCounts = countPieces(board.capturedBySente);
  for (const [type, count] of Object.entries(senteCounts)) {
    const sfen = SFEN_PIECE_MAP[type as PieceType];
    const pieceStr = count > 1 ? `${count}${sfen}` : sfen;
    pieces.push(pieceStr.toUpperCase());
  }

  // 後手の持ち駒
  const goteCounts = countPieces(board.capturedByGote);
  for (const [type, count] of Object.entries(goteCounts)) {
    const sfen = SFEN_PIECE_MAP[type as PieceType];
    const pieceStr = count > 1 ? `${count}${sfen}` : sfen;
    pieces.push(pieceStr.toLowerCase());
  }

  return pieces.length > 0 ? pieces.join("") : "-";
}

/**
 * 駒のリストを種類ごとにカウント
 */
function countPieces(pieces: PieceType[]): Record<string, number> {
  const counts: Record<string, number> = {};

  // SFEN順序: 飛、角、金、銀、桂、香、歩
  const order = [
    PieceType.Rook,
    PieceType.Bishop,
    PieceType.Gold,
    PieceType.Silver,
    PieceType.Knight,
    PieceType.Lance,
    PieceType.Pawn,
  ];

  for (const piece of pieces) {
    counts[piece] = (counts[piece] || 0) + 1;
  }

  // 順序を保証するために並べ替え
  const sortedCounts: Record<string, number> = {};
  for (const type of order) {
    if (counts[type]) {
      sortedCounts[type] = counts[type];
    }
  }

  return sortedCounts;
}

/**
 * SFEN形式の文字列を盤面データに変換
 * @param sfen SFEN形式の文字列
 * @returns 盤面データ
 */
export function sfenToBoard(sfen: string): Board {
  const parts = sfen.trim().split(/\s+/);

  if (parts.length < 2) {
    throw new Error("Invalid SFEN format: insufficient parts");
  }

  const [boardPart, turnPart, handPart = "-"] = parts;

  // 1. 盤面の解析
  const cells: Cell[][] = [];
  const rows = boardPart.split("/");

  if (rows.length !== 9) {
    throw new Error(`Invalid SFEN format: expected 9 rows, got ${rows.length}`);
  }

  for (const rowStr of rows) {
    const row: Cell[] = [];
    let i = 0;

    while (i < rowStr.length) {
      const char = rowStr[i];

      // 数字（空きマス）の場合
      if (/\d/.test(char)) {
        const emptyCount = parseInt(char, 10);
        for (let j = 0; j < emptyCount; j++) {
          row.push(null);
        }
        i++;
      }
      // 成り駒の場合
      else if (char === "+") {
        const nextChar = rowStr[i + 1];
        if (!nextChar) {
          throw new Error(`Invalid SFEN format: incomplete promoted piece`);
        }

        const sfenKey = `+${nextChar.toLowerCase()}`;
        const pieceType = SFEN_TO_PIECE_TYPE[sfenKey];

        if (!pieceType) {
          throw new Error(
            `Invalid SFEN format: unknown promoted piece ${sfenKey}`
          );
        }

        const player = /[A-Z]/.test(nextChar) ? Player.Sente : Player.Gote;
        row.push({ type: pieceType, player });
        i += 2;
      }
      // 通常の駒の場合
      else {
        const sfenKey = char.toLowerCase();
        const pieceType = SFEN_TO_PIECE_TYPE[sfenKey];

        if (!pieceType) {
          throw new Error(`Invalid SFEN format: unknown piece ${char}`);
        }

        const player = /[A-Z]/.test(char) ? Player.Sente : Player.Gote;
        row.push({ type: pieceType, player });
        i++;
      }
    }

    if (row.length !== 9) {
      throw new Error(
        `Invalid SFEN format: expected 9 columns, got ${row.length}`
      );
    }

    cells.push(row);
  }

  // 2. 手番の解析
  const turn = turnPart === "b" ? Player.Sente : Player.Gote;

  // 3. 持ち駒の解析
  const { capturedBySente, capturedByGote } = parseHand(handPart);

  return {
    cells,
    capturedBySente,
    capturedByGote,
    turn,
  };
}

/**
 * SFEN形式の持ち駒文字列を解析
 */
function parseHand(handPart: string): {
  capturedBySente: PieceType[];
  capturedByGote: PieceType[];
} {
  const capturedBySente: PieceType[] = [];
  const capturedByGote: PieceType[] = [];

  if (handPart === "-") {
    return { capturedBySente, capturedByGote };
  }

  let i = 0;
  while (i < handPart.length) {
    const char = handPart[i];

    // 数字の場合
    if (/\d/.test(char)) {
      // 数字を読み取る
      let numStr = char;
      i++;
      while (i < handPart.length && /\d/.test(handPart[i])) {
        numStr += handPart[i];
        i++;
      }
      const count = parseInt(numStr, 10);

      // 次の文字が駒
      if (i >= handPart.length) {
        throw new Error("Invalid SFEN hand format: number without piece");
      }

      const pieceChar = handPart[i];
      const sfenKey = pieceChar.toLowerCase();
      const pieceType = SFEN_TO_PIECE_TYPE[sfenKey];

      if (!pieceType) {
        throw new Error(`Invalid SFEN hand format: unknown piece ${pieceChar}`);
      }

      const targetArray = /[A-Z]/.test(pieceChar)
        ? capturedBySente
        : capturedByGote;

      for (let j = 0; j < count; j++) {
        targetArray.push(pieceType);
      }

      i++;
    }
    // 駒の場合
    else {
      const sfenKey = char.toLowerCase();
      const pieceType = SFEN_TO_PIECE_TYPE[sfenKey];

      if (!pieceType) {
        throw new Error(`Invalid SFEN hand format: unknown piece ${char}`);
      }

      const targetArray = /[A-Z]/.test(char)
        ? capturedBySente
        : capturedByGote;
      targetArray.push(pieceType);

      i++;
    }
  }

  return { capturedBySente, capturedByGote };
}
