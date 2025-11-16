import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

/** 局面解析リクエスト */
export type AnalysisInput = {
  /** 探索深さ（指定時はtimeMsを無視） */
  depth?: InputMaybe<Scalars['Int']['input']>;
  /** 初期局面からの指し手リスト（USI形式） */
  moves?: InputMaybe<Array<Scalars['String']['input']>>;
  /** 候補手の数（MultiPV、デフォルト: 1） */
  multipv?: InputMaybe<Scalars['Int']['input']>;
  /** SFEN形式の局面文字列（省略時は平手初期局面） */
  sfen?: InputMaybe<Scalars['String']['input']>;
  /** 思考時間（ミリ秒、デフォルト: 1000） */
  timeMs?: InputMaybe<Scalars['Int']['input']>;
};

/** 局面解析結果 */
export type AnalysisResult = {
  __typename?: 'AnalysisResult';
  /** 最善手（USI形式） */
  bestmove: Scalars['String']['output'];
  /** エンジン名 */
  engineName: Scalars['String']['output'];
  /** 実際の思考時間（ミリ秒） */
  timeMs: Scalars['Int']['output'];
  /** 候補手リスト（MultiPV） */
  variations: Array<MoveVariation>;
};

/** チャットメッセージ */
export type ChatMessage = {
  __typename?: 'ChatMessage';
  content: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  matchId: Scalars['ID']['output'];
  metadata?: Maybe<Scalars['String']['output']>;
  role: MessageRole;
};

/** チャットメッセージ作成入力 */
export type CreateChatMessageInput = {
  /** メッセージ本文 */
  content: Scalars['String']['input'];
  /** 対局ID */
  matchId: Scalars['ID']['input'];
  /** メタデータ（JSON形式） */
  metadata?: InputMaybe<Scalars['String']['input']>;
  /** 送信者ロール */
  role: MessageRole;
};

/** 対局作成入力 */
export type CreateMatchInput = {
  /** 後手のプレイヤー名 */
  playerGote?: InputMaybe<Scalars['String']['input']>;
  /** 先手のプレイヤー名 */
  playerSente?: InputMaybe<Scalars['String']['input']>;
};

/** 局面作成入力 */
export type CreateMatchStateInput = {
  /** 局面番号 */
  index: Scalars['Int']['input'];
  /** 対局ID */
  matchId: Scalars['ID']['input'];
  /** 指し手（USI形式） */
  moveNotation?: InputMaybe<Scalars['String']['input']>;
  /** 手番プレイヤー */
  player: Player;
  /** 盤面（SFEN形式） */
  sfen: Scalars['String']['input'];
  /** 消費時間（秒） */
  thinkingTime?: InputMaybe<Scalars['Int']['input']>;
};

export type Health = {
  __typename?: 'Health';
  status: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
};

/** 対局情報 */
export type Match = {
  __typename?: 'Match';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  messages: Array<ChatMessage>;
  playerGote?: Maybe<Scalars['String']['output']>;
  playerSente?: Maybe<Scalars['String']['output']>;
  states: Array<MatchState>;
  status: MatchStatus;
  updatedAt: Scalars['String']['output'];
};

/** 局面情報 */
export type MatchState = {
  __typename?: 'MatchState';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  index: Scalars['Int']['output'];
  matchId: Scalars['ID']['output'];
  moveNotation?: Maybe<Scalars['String']['output']>;
  player: Player;
  sfen: Scalars['String']['output'];
  thinkingTime?: Maybe<Scalars['Int']['output']>;
};

/** 対局状況 */
export enum MatchStatus {
  Abandoned = 'ABANDONED',
  Completed = 'COMPLETED',
  Ongoing = 'ONGOING'
}

/** メッセージ送信者ロール */
export enum MessageRole {
  Assistant = 'ASSISTANT',
  System = 'SYSTEM',
  User = 'USER'
}

/** 1つの候補手情報 */
export type MoveVariation = {
  __typename?: 'MoveVariation';
  /** 探索深さ */
  depth: Scalars['Int']['output'];
  /** 指し手（USI形式） */
  move: Scalars['String']['output'];
  /** 探索ノード数 */
  nodes?: Maybe<Scalars['Int']['output']>;
  /** 読み筋（PV） */
  pv?: Maybe<Array<Scalars['String']['output']>>;
  /** 評価値（センチポーン） */
  scoreCp?: Maybe<Scalars['Int']['output']>;
  /** 詰みまでの手数（プライ数） */
  scoreMate?: Maybe<Scalars['Int']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  analyzePosition: AnalysisResult;
  createChatMessage: ChatMessage;
  createMatch: Match;
  createMatchState: MatchState;
};


export type MutationAnalyzePositionArgs = {
  input: AnalysisInput;
};


export type MutationCreateChatMessageArgs = {
  input: CreateChatMessageInput;
};


export type MutationCreateMatchArgs = {
  input: CreateMatchInput;
};


export type MutationCreateMatchStateArgs = {
  input: CreateMatchStateInput;
};

/** プレイヤー */
export enum Player {
  Gote = 'GOTE',
  Sente = 'SENTE'
}

export type Query = {
  __typename?: 'Query';
  getMatches: Array<Match>;
  health: Health;
};

export type HealthQueryVariables = Exact<{ [key: string]: never; }>;


export type HealthQuery = { __typename?: 'Query', health: { __typename?: 'Health', status: string, timestamp: string } };


export const HealthDocument = gql`
    query Health {
  health {
    status
    timestamp
  }
}
    `;

export function useHealthQuery(options?: Omit<Urql.UseQueryArgs<HealthQueryVariables>, 'query'>) {
  return Urql.useQuery<HealthQuery, HealthQueryVariables>({ query: HealthDocument, ...options });
};