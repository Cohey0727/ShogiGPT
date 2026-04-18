/**
 * shogi-ai 内部ロジックで使用する型定義
 */

/** エンジン情報 */
export interface EngineInfo {
  name: string;
  author: string;
  version: string;
  options: Record<string, string>;
}

/** 1つの候補手情報 */
export interface MoveInfo {
  /** 指し手（USI形式） */
  move: string;
  /** 評価値（センチポーン） */
  scoreCp: number | null;
  /** 詰みまでの手数（プライ数） */
  scoreMate: number | null;
  /** 探索深さ */
  depth: number;
  /** 探索ノード数 */
  nodes: number | null;
  /** 読み筋（PV） */
  pv: string[] | null;
}

/** 局面解析リクエスト */
export interface AnalyzeRequest {
  sfen?: string | null;
  moves?: string[] | null;
  /** 思考時間（ミリ秒）。depth指定時は無視 */
  timeMs?: number;
  /** 探索深さ（指定時は固定深さ探索） */
  depth?: number | null;
  /** 候補手の数（MultiPV） */
  multipv?: number;
}

/** 局面解析レスポンス */
export interface AnalyzeResponse {
  /** 最善手（USI形式） */
  bestmove: string;
  /** 候補手リスト（MultiPV） */
  variations: MoveInfo[];
  /** 実際の思考時間 */
  timeMs: number;
  /** エンジン名 */
  engineName: string;
}

/** 詰み探索リクエスト */
export interface MateSearchRequest {
  sfen?: string | null;
  moves?: string[] | null;
  /** 詰み探索時間（ミリ秒） */
  timeMs?: number;
}

/** 詰み探索レスポンス */
export interface MateSearchResponse {
  /** 詰みが見つかったか */
  mateFound: boolean;
  /** 詰み手順（USI形式） */
  mateMoves?: string[] | null;
  /** 詰みまでの手数 */
  mateLength?: number | null;
  /** メッセージ */
  message?: string | null;
}

/** エンジンプール設定 */
export interface EnginePoolConfig {
  enginePath: string;
  /** エンジンワーキングディレクトリ（評価関数ファイルのあるディレクトリ） */
  engineCwd: string;
  /** プールサイズ（並列リクエスト数） */
  poolSize: number;
  /** USIエンジンオプション */
  options: Record<string, string>;
}
