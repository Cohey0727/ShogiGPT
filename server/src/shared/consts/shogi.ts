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
  },
  [PieceType.Rook]: {
    name: "飛",
    promoted: PieceType.PromotedRook,
  },
  [PieceType.Bishop]: {
    name: "角",
    promoted: PieceType.PromotedBishop,
  },
  [PieceType.Gold]: {
    name: "金",
  },
  [PieceType.Silver]: {
    name: "銀",
    promoted: PieceType.PromotedSilver,
  },
  [PieceType.Knight]: {
    name: "桂",
    promoted: PieceType.PromotedKnight,
  },
  [PieceType.Lance]: {
    name: "香",
    promoted: PieceType.PromotedLance,
  },
  [PieceType.Pawn]: {
    name: "歩",
    promoted: PieceType.PromotedPawn,
  },
  [PieceType.PromotedRook]: {
    name: "竜",
    unpromoted: PieceType.Rook,
  },
  [PieceType.PromotedBishop]: {
    name: "馬",
    unpromoted: PieceType.Bishop,
  },
  [PieceType.PromotedSilver]: {
    name: "成銀",
    unpromoted: PieceType.Silver,
  },
  [PieceType.PromotedKnight]: {
    name: "成桂",
    unpromoted: PieceType.Knight,
  },
  [PieceType.PromotedLance]: {
    name: "成香",
    unpromoted: PieceType.Lance,
  },
  [PieceType.PromotedPawn]: {
    name: "と",
    unpromoted: PieceType.Pawn,
  },
};
