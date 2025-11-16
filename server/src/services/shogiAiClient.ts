/**
 * Shogi AI Client Service
 * やねうら王APIとの通信を管理
 */

import { createClient } from '../generated/shogi-api/client';
import {
  analyzePositionAnalyzePost,
  getEngineInfoEngineInfoGet,
  healthCheckHealthGet,
} from '../generated/shogi-api';
import type {
  AnalysisRequest,
  AnalysisResponse,
  EngineInfoResponse,
} from '../generated/shogi-api';

/**
 * Shogi AI APIのベースURL
 * 環境変数で変更可能、デフォルトはlocalhost:8000
 */
const SHOGI_AI_BASE_URL = process.env.SHOGI_AI_URL || 'http://localhost:8000';

/**
 * グローバルクライアントインスタンス
 */
const client = createClient({
  baseUrl: SHOGI_AI_BASE_URL,
});

/**
 * 局面解析パラメータ
 */
export interface AnalyzePositionParams {
  /** SFEN形式の局面文字列（省略時は平手初期局面） */
  sfen?: string;
  /** 初期局面からの指し手リスト（USI形式） */
  moves?: string[];
  /** 思考時間（ミリ秒、デフォルト: 1000） */
  timeMs?: number;
  /** 探索深さ（指定時はtimeMsを無視） */
  depth?: number;
  /** 候補手の数（MultiPV、デフォルト: 1） */
  multipv?: number;
}

/**
 * Shogi AI クライアント
 */
export class ShogiAiClient {
  /**
   * エンジンのヘルスチェック
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const { data, error } = await healthCheckHealthGet({ client });
      return !error && !!data;
    } catch {
      return false;
    }
  }

  /**
   * エンジン情報を取得
   */
  static async getEngineInfo(): Promise<EngineInfoResponse | null> {
    try {
      const { data, error } = await getEngineInfoEngineInfoGet({ client });
      if (error) {
        console.error('Failed to get engine info:', error);
        return null;
      }
      return data ?? null;
    } catch (err) {
      console.error('Error getting engine info:', err);
      return null;
    }
  }

  /**
   * 局面を解析
   *
   * @param params 解析パラメータ
   * @returns 解析結果
   * @throws エラー発生時
   */
  static async analyzePosition(
    params: AnalyzePositionParams
  ): Promise<AnalysisResponse> {
    const request: AnalysisRequest = {
      sfen: params.sfen,
      moves: params.moves,
      time_ms: params.timeMs,
      depth: params.depth,
      multipv: params.multipv,
    };

    try {
      const { data, error } = await analyzePositionAnalyzePost({
        client,
        body: request,
      });

      if (error) {
        throw new Error(
          `Analysis failed: ${JSON.stringify(error)}`
        );
      }

      if (!data) {
        throw new Error('No data returned from analysis');
      }

      return data;
    } catch (err) {
      console.error('Error analyzing position:', err);
      throw err;
    }
  }
}
