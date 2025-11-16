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
export const MatchStatus = {
  Abandoned: 'ABANDONED',
  Completed: 'COMPLETED',
  Ongoing: 'ONGOING'
} as const;

export type MatchStatus = typeof MatchStatus[keyof typeof MatchStatus];
/** メッセージ送信者ロール */
export const MessageRole = {
  Assistant: 'ASSISTANT',
  System: 'SYSTEM',
  User: 'USER'
} as const;

export type MessageRole = typeof MessageRole[keyof typeof MessageRole];
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
export const Player = {
  Gote: 'GOTE',
  Sente: 'SENTE'
} as const;

export type Player = typeof Player[keyof typeof Player];
export type Query = {
  __typename?: 'Query';
  getChatMessages: Array<ChatMessage>;
  getMatches: Array<Match>;
  health: Health;
};


export type QueryGetChatMessagesArgs = {
  matchId: Scalars['ID']['input'];
};

export type HealthQueryVariables = Exact<{ [key: string]: never; }>;


export type HealthQuery = { __typename?: 'Query', health: { __typename?: 'Health', status: string, timestamp: string } };

export type GetMatchesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMatchesQuery = { __typename?: 'Query', getMatches: Array<{ __typename?: 'Match', id: string, createdAt: string, updatedAt: string, status: MatchStatus, playerSente?: string | null | undefined, playerGote?: string | null | undefined, states: Array<{ __typename?: 'MatchState', id: string, createdAt: string, matchId: string, index: number, moveNotation?: string | null | undefined, player: Player, sfen: string, thinkingTime?: number | null | undefined }>, messages: Array<{ __typename?: 'ChatMessage', id: string, createdAt: string, matchId: string, role: MessageRole, content: string, metadata?: string | null | undefined }> }> };

export type GetChatMessagesQueryVariables = Exact<{
  matchId: Scalars['ID']['input'];
}>;


export type GetChatMessagesQuery = { __typename?: 'Query', getChatMessages: Array<{ __typename?: 'ChatMessage', id: string, createdAt: string, matchId: string, role: MessageRole, content: string, metadata?: string | null | undefined }> };

export type CreateMatchMutationVariables = Exact<{
  input: CreateMatchInput;
}>;


export type CreateMatchMutation = { __typename?: 'Mutation', createMatch: { __typename?: 'Match', id: string, createdAt: string, updatedAt: string, status: MatchStatus, playerSente?: string | null | undefined, playerGote?: string | null | undefined, states: Array<{ __typename?: 'MatchState', id: string, createdAt: string, matchId: string, index: number, moveNotation?: string | null | undefined, player: Player, sfen: string, thinkingTime?: number | null | undefined }>, messages: Array<{ __typename?: 'ChatMessage', id: string, createdAt: string, matchId: string, role: MessageRole, content: string, metadata?: string | null | undefined }> } };

export type CreateChatMessageMutationVariables = Exact<{
  input: CreateChatMessageInput;
}>;


export type CreateChatMessageMutation = { __typename?: 'Mutation', createChatMessage: { __typename?: 'ChatMessage', id: string, createdAt: string, matchId: string, role: MessageRole, content: string, metadata?: string | null | undefined } };

export type AnalyzePositionMutationVariables = Exact<{
  input: AnalysisInput;
}>;


export type AnalyzePositionMutation = { __typename?: 'Mutation', analyzePosition: { __typename?: 'AnalysisResult', bestmove: string, timeMs: number, engineName: string, variations: Array<{ __typename?: 'MoveVariation', move: string, scoreCp?: number | null | undefined, scoreMate?: number | null | undefined, depth: number, nodes?: number | null | undefined, pv?: Array<string> | null | undefined }> } };


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
export const GetMatchesDocument = gql`
    query GetMatches {
  getMatches {
    id
    createdAt
    updatedAt
    status
    playerSente
    playerGote
    states {
      id
      createdAt
      matchId
      index
      moveNotation
      player
      sfen
      thinkingTime
    }
    messages {
      id
      createdAt
      matchId
      role
      content
      metadata
    }
  }
}
    `;

export function useGetMatchesQuery(options?: Omit<Urql.UseQueryArgs<GetMatchesQueryVariables>, 'query'>) {
  return Urql.useQuery<GetMatchesQuery, GetMatchesQueryVariables>({ query: GetMatchesDocument, ...options });
};
export const GetChatMessagesDocument = gql`
    query GetChatMessages($matchId: ID!) {
  getChatMessages(matchId: $matchId) {
    id
    createdAt
    matchId
    role
    content
    metadata
  }
}
    `;

export function useGetChatMessagesQuery(options: Omit<Urql.UseQueryArgs<GetChatMessagesQueryVariables>, 'query'>) {
  return Urql.useQuery<GetChatMessagesQuery, GetChatMessagesQueryVariables>({ query: GetChatMessagesDocument, ...options });
};
export const CreateMatchDocument = gql`
    mutation CreateMatch($input: CreateMatchInput!) {
  createMatch(input: $input) {
    id
    createdAt
    updatedAt
    status
    playerSente
    playerGote
    states {
      id
      createdAt
      matchId
      index
      moveNotation
      player
      sfen
      thinkingTime
    }
    messages {
      id
      createdAt
      matchId
      role
      content
      metadata
    }
  }
}
    `;

export function useCreateMatchMutation() {
  return Urql.useMutation<CreateMatchMutation, CreateMatchMutationVariables>(CreateMatchDocument);
};
export const CreateChatMessageDocument = gql`
    mutation CreateChatMessage($input: CreateChatMessageInput!) {
  createChatMessage(input: $input) {
    id
    createdAt
    matchId
    role
    content
    metadata
  }
}
    `;

export function useCreateChatMessageMutation() {
  return Urql.useMutation<CreateChatMessageMutation, CreateChatMessageMutationVariables>(CreateChatMessageDocument);
};
export const AnalyzePositionDocument = gql`
    mutation AnalyzePosition($input: AnalysisInput!) {
  analyzePosition(input: $input) {
    bestmove
    variations {
      move
      scoreCp
      scoreMate
      depth
      nodes
      pv
    }
    timeMs
    engineName
  }
}
    `;

export function useAnalyzePositionMutation() {
  return Urql.useMutation<AnalyzePositionMutation, AnalyzePositionMutationVariables>(AnalyzePositionDocument);
};