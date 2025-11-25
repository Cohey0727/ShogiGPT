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
  MatchStatus: { input: 'ONGOING' | 'COMPLETED' | 'ABANDONED'; output: 'ONGOING' | 'COMPLETED' | 'ABANDONED'; }
  MessageRole: { input: 'USER' | 'ASSISTANT'; output: 'USER' | 'ASSISTANT'; }
  /** プレイヤータイプ（HUMAN または AI） */
  PlayerType: { input: 'HUMAN' | 'AI'; output: 'HUMAN' | 'AI'; }
  jsonb: { input: any; output: any; }
  timestamp: { input: string; output: string; }
};

/** AIプロンプトのパーソナリティ設定 */
export const AiPromptPersonality = {
  /** 常に煽る */
  Always: 'always',
  /** 煽りなし */
  None: 'none',
  /** 戦況に応じて煽る */
  Situational: 'situational'
} as const;

export type AiPromptPersonality = typeof AiPromptPersonality[keyof typeof AiPromptPersonality];
/** 最善手コンテンツ（盤面解析結果） */
export type BestMoveContent = {
  __typename?: 'BestMoveContent';
  /** 最善手（USI形式） */
  bestmove: Scalars['String']['output'];
  /** エンジン名 */
  engineName: Scalars['String']['output'];
  /** SFEN形式の盤面情報 */
  sfen: Scalars['String']['output'];
  /** 思考時間（ミリ秒） */
  timeMs: Scalars['Int']['output'];
  type: Scalars['String']['output'];
  /** 候補手リスト（MultiPV） */
  variations: Array<MoveVariation>;
};

/** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
export type BooleanComparisonExp = {
  _eq?: InputMaybe<Scalars['Boolean']['input']>;
  _gt?: InputMaybe<Scalars['Boolean']['input']>;
  _gte?: InputMaybe<Scalars['Boolean']['input']>;
  _in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  _isNull?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Boolean']['input']>;
  _lte?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Scalars['Boolean']['input']>;
  _nin?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

/** チャットメッセージ */
export type ChatMessage = {
  __typename?: 'ChatMessage';
  /** メッセージコンテンツ（Markdownや候補手などを含む配列） */
  contents: Array<MessageContent>;
  /** 作成日時 */
  createdAt: Scalars['String']['output'];
  /** メッセージID */
  id: Scalars['String']['output'];
  /** 入力途中かどうか（AI応答待ち） */
  isPartial: Scalars['Boolean']['output'];
  /** 対局ID */
  matchId: Scalars['String']['output'];
  /** メッセージ役割 */
  role: Scalars['String']['output'];
};

/** columns and relationships of "chat_messages" */
export type ChatMessages = {
  __typename?: 'ChatMessages';
  contents: Scalars['jsonb']['output'];
  createdAt: Scalars['timestamp']['output'];
  id: Scalars['String']['output'];
  isPartial: Scalars['Boolean']['output'];
  /** An object relationship */
  match: Matches;
  matchId: Scalars['String']['output'];
  metadata?: Maybe<Scalars['String']['output']>;
  role: Scalars['MessageRole']['output'];
};


/** columns and relationships of "chat_messages" */
export type ChatMessagesContentsArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** order by aggregate values of table "chat_messages" */
export type ChatMessagesAggregateOrderBy = {
  count?: InputMaybe<OrderBy>;
  max?: InputMaybe<ChatMessagesMaxOrderBy>;
  min?: InputMaybe<ChatMessagesMinOrderBy>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type ChatMessagesAppendInput = {
  contents?: InputMaybe<Scalars['jsonb']['input']>;
};

/** input type for inserting array relation for remote table "chat_messages" */
export type ChatMessagesArrRelInsertInput = {
  data: Array<ChatMessagesInsertInput>;
  /** upsert condition */
  onConflict?: InputMaybe<ChatMessagesOnConflict>;
};

/** Boolean expression to filter rows from the table "chat_messages". All fields are combined with a logical 'AND'. */
export type ChatMessagesBoolExp = {
  _and?: InputMaybe<Array<ChatMessagesBoolExp>>;
  _not?: InputMaybe<ChatMessagesBoolExp>;
  _or?: InputMaybe<Array<ChatMessagesBoolExp>>;
  contents?: InputMaybe<JsonbComparisonExp>;
  createdAt?: InputMaybe<TimestampComparisonExp>;
  id?: InputMaybe<StringComparisonExp>;
  isPartial?: InputMaybe<BooleanComparisonExp>;
  match?: InputMaybe<MatchesBoolExp>;
  matchId?: InputMaybe<StringComparisonExp>;
  metadata?: InputMaybe<StringComparisonExp>;
  role?: InputMaybe<MessageRoleComparisonExp>;
};

/** unique or primary key constraints on table "chat_messages" */
export const ChatMessagesConstraint = {
  /** unique or primary key constraint on columns "id" */
  ChatMessagesPkey: 'chat_messages_pkey'
} as const;

export type ChatMessagesConstraint = typeof ChatMessagesConstraint[keyof typeof ChatMessagesConstraint];
/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type ChatMessagesDeleteAtPathInput = {
  contents?: InputMaybe<Array<Scalars['String']['input']>>;
};

/**
 * delete the array element with specified index (negative integers count from the
 * end). throws an error if top level container is not an array
 */
export type ChatMessagesDeleteElemInput = {
  contents?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type ChatMessagesDeleteKeyInput = {
  contents?: InputMaybe<Scalars['String']['input']>;
};

/** input type for inserting data into table "chat_messages" */
export type ChatMessagesInsertInput = {
  contents?: InputMaybe<Scalars['jsonb']['input']>;
  createdAt?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  isPartial?: InputMaybe<Scalars['Boolean']['input']>;
  match?: InputMaybe<MatchesObjRelInsertInput>;
  matchId?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['MessageRole']['input']>;
};

/** order by max() on columns of table "chat_messages" */
export type ChatMessagesMaxOrderBy = {
  createdAt?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  matchId?: InputMaybe<OrderBy>;
  metadata?: InputMaybe<OrderBy>;
  role?: InputMaybe<OrderBy>;
};

/** order by min() on columns of table "chat_messages" */
export type ChatMessagesMinOrderBy = {
  createdAt?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  matchId?: InputMaybe<OrderBy>;
  metadata?: InputMaybe<OrderBy>;
  role?: InputMaybe<OrderBy>;
};

/** response of any mutation on the table "chat_messages" */
export type ChatMessagesMutationResponse = {
  __typename?: 'ChatMessagesMutationResponse';
  /** number of rows affected by the mutation */
  affectedRows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<ChatMessages>;
};

/** on_conflict condition type for table "chat_messages" */
export type ChatMessagesOnConflict = {
  constraint: ChatMessagesConstraint;
  updateColumns?: Array<ChatMessagesUpdateColumn>;
  where?: InputMaybe<ChatMessagesBoolExp>;
};

/** Ordering options when selecting data from "chat_messages". */
export type ChatMessagesOrderBy = {
  contents?: InputMaybe<OrderBy>;
  createdAt?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  isPartial?: InputMaybe<OrderBy>;
  match?: InputMaybe<MatchesOrderBy>;
  matchId?: InputMaybe<OrderBy>;
  metadata?: InputMaybe<OrderBy>;
  role?: InputMaybe<OrderBy>;
};

/** primary key columns input for table: chat_messages */
export type ChatMessagesPkColumnsInput = {
  id: Scalars['String']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type ChatMessagesPrependInput = {
  contents?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "chat_messages" */
export const ChatMessagesSelectColumn = {
  /** column name */
  Contents: 'contents',
  /** column name */
  CreatedAt: 'createdAt',
  /** column name */
  Id: 'id',
  /** column name */
  IsPartial: 'isPartial',
  /** column name */
  MatchId: 'matchId',
  /** column name */
  Metadata: 'metadata',
  /** column name */
  Role: 'role'
} as const;

export type ChatMessagesSelectColumn = typeof ChatMessagesSelectColumn[keyof typeof ChatMessagesSelectColumn];
/** input type for updating data in table "chat_messages" */
export type ChatMessagesSetInput = {
  contents?: InputMaybe<Scalars['jsonb']['input']>;
  createdAt?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  isPartial?: InputMaybe<Scalars['Boolean']['input']>;
  matchId?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['MessageRole']['input']>;
};

/** Streaming cursor of the table "chat_messages" */
export type ChatMessagesStreamCursorInput = {
  /** Stream column input with initial value */
  initialValue: ChatMessagesStreamCursorValueInput;
  /** cursor ordering */
  ordering?: InputMaybe<CursorOrdering>;
};

/** Initial value of the column from where the streaming should start */
export type ChatMessagesStreamCursorValueInput = {
  contents?: InputMaybe<Scalars['jsonb']['input']>;
  createdAt?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  isPartial?: InputMaybe<Scalars['Boolean']['input']>;
  matchId?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['MessageRole']['input']>;
};

/** update columns of table "chat_messages" */
export const ChatMessagesUpdateColumn = {
  /** column name */
  Contents: 'contents',
  /** column name */
  CreatedAt: 'createdAt',
  /** column name */
  Id: 'id',
  /** column name */
  IsPartial: 'isPartial',
  /** column name */
  MatchId: 'matchId',
  /** column name */
  Metadata: 'metadata',
  /** column name */
  Role: 'role'
} as const;

export type ChatMessagesUpdateColumn = typeof ChatMessagesUpdateColumn[keyof typeof ChatMessagesUpdateColumn];
export type ChatMessagesUpdates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<ChatMessagesAppendInput>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _deleteAtPath?: InputMaybe<ChatMessagesDeleteAtPathInput>;
  /**
   * delete the array element with specified index (negative integers count from
   * the end). throws an error if top level container is not an array
   */
  _deleteElem?: InputMaybe<ChatMessagesDeleteElemInput>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _deleteKey?: InputMaybe<ChatMessagesDeleteKeyInput>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<ChatMessagesPrependInput>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<ChatMessagesSetInput>;
  /** filter the rows which have to be updated */
  where: ChatMessagesBoolExp;
};

/** ordering argument of a cursor */
export const CursorOrdering = {
  /** ascending ordering of the cursor */
  Asc: 'ASC',
  /** descending ordering of the cursor */
  Desc: 'DESC'
} as const;

export type CursorOrdering = typeof CursorOrdering[keyof typeof CursorOrdering];
/** 対局状態評価リクエスト */
export type EvaluateMatchStateInput = {
  /** 最善手を盤面に反映するかどうか */
  applyBestMove?: InputMaybe<Scalars['Boolean']['input']>;
  /** 局面番号 */
  index: Scalars['Int']['input'];
  /** 対局ID */
  matchId: Scalars['String']['input'];
  /** 候補手の数（MultiPV、デフォルト: 3） */
  multipv?: InputMaybe<Scalars['Int']['input']>;
  /** 消費時間（秒） */
  thinkingTime?: InputMaybe<Scalars['Int']['input']>;
};

/** 対局状態評価結果 */
export type EvaluateMatchStateResult = {
  __typename?: 'EvaluateMatchStateResult';
  /** 最善手（USI形式） */
  bestmove: Scalars['String']['output'];
  /** エンジン名 */
  engineName: Scalars['String']['output'];
  /** SFEN形式の盤面情報 */
  sfen: Scalars['String']['output'];
  /** 思考時間（ミリ秒） */
  timeMs: Scalars['Int']['output'];
  type: Scalars['String']['output'];
  /** 候補手リスト（MultiPV） */
  variations: Array<MoveVariation>;
};

/** columns and relationships of "evaluations" */
export type Evaluations = {
  __typename?: 'Evaluations';
  createdAt: Scalars['timestamp']['output'];
  engineName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  /** An array relationship */
  matchStates: Array<MatchStates>;
  sfen: Scalars['String']['output'];
  updatedAt: Scalars['timestamp']['output'];
  variations: Scalars['jsonb']['output'];
};


/** columns and relationships of "evaluations" */
export type EvaluationsMatchStatesArgs = {
  distinctOn?: InputMaybe<Array<MatchStatesSelectColumn>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<MatchStatesOrderBy>>;
  where?: InputMaybe<MatchStatesBoolExp>;
};


/** columns and relationships of "evaluations" */
export type EvaluationsVariationsArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type EvaluationsAppendInput = {
  variations?: InputMaybe<Scalars['jsonb']['input']>;
};

/** Boolean expression to filter rows from the table "evaluations". All fields are combined with a logical 'AND'. */
export type EvaluationsBoolExp = {
  _and?: InputMaybe<Array<EvaluationsBoolExp>>;
  _not?: InputMaybe<EvaluationsBoolExp>;
  _or?: InputMaybe<Array<EvaluationsBoolExp>>;
  createdAt?: InputMaybe<TimestampComparisonExp>;
  engineName?: InputMaybe<StringComparisonExp>;
  id?: InputMaybe<StringComparisonExp>;
  matchStates?: InputMaybe<MatchStatesBoolExp>;
  sfen?: InputMaybe<StringComparisonExp>;
  updatedAt?: InputMaybe<TimestampComparisonExp>;
  variations?: InputMaybe<JsonbComparisonExp>;
};

/** unique or primary key constraints on table "evaluations" */
export const EvaluationsConstraint = {
  /** unique or primary key constraint on columns "id" */
  EvaluationsPkey: 'evaluations_pkey',
  /** unique or primary key constraint on columns "engineName", "sfen" */
  EvaluationsSfenEngineNameKey: 'evaluations_sfen_engineName_key'
} as const;

export type EvaluationsConstraint = typeof EvaluationsConstraint[keyof typeof EvaluationsConstraint];
/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type EvaluationsDeleteAtPathInput = {
  variations?: InputMaybe<Array<Scalars['String']['input']>>;
};

/**
 * delete the array element with specified index (negative integers count from the
 * end). throws an error if top level container is not an array
 */
export type EvaluationsDeleteElemInput = {
  variations?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type EvaluationsDeleteKeyInput = {
  variations?: InputMaybe<Scalars['String']['input']>;
};

/** input type for inserting data into table "evaluations" */
export type EvaluationsInsertInput = {
  createdAt?: InputMaybe<Scalars['timestamp']['input']>;
  engineName?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  matchStates?: InputMaybe<MatchStatesArrRelInsertInput>;
  sfen?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamp']['input']>;
  variations?: InputMaybe<Scalars['jsonb']['input']>;
};

/** response of any mutation on the table "evaluations" */
export type EvaluationsMutationResponse = {
  __typename?: 'EvaluationsMutationResponse';
  /** number of rows affected by the mutation */
  affectedRows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Evaluations>;
};

/** input type for inserting object relation for remote table "evaluations" */
export type EvaluationsObjRelInsertInput = {
  data: EvaluationsInsertInput;
  /** upsert condition */
  onConflict?: InputMaybe<EvaluationsOnConflict>;
};

/** on_conflict condition type for table "evaluations" */
export type EvaluationsOnConflict = {
  constraint: EvaluationsConstraint;
  updateColumns?: Array<EvaluationsUpdateColumn>;
  where?: InputMaybe<EvaluationsBoolExp>;
};

/** Ordering options when selecting data from "evaluations". */
export type EvaluationsOrderBy = {
  createdAt?: InputMaybe<OrderBy>;
  engineName?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  matchStatesAggregate?: InputMaybe<MatchStatesAggregateOrderBy>;
  sfen?: InputMaybe<OrderBy>;
  updatedAt?: InputMaybe<OrderBy>;
  variations?: InputMaybe<OrderBy>;
};

/** primary key columns input for table: evaluations */
export type EvaluationsPkColumnsInput = {
  id: Scalars['String']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type EvaluationsPrependInput = {
  variations?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "evaluations" */
export const EvaluationsSelectColumn = {
  /** column name */
  CreatedAt: 'createdAt',
  /** column name */
  EngineName: 'engineName',
  /** column name */
  Id: 'id',
  /** column name */
  Sfen: 'sfen',
  /** column name */
  UpdatedAt: 'updatedAt',
  /** column name */
  Variations: 'variations'
} as const;

export type EvaluationsSelectColumn = typeof EvaluationsSelectColumn[keyof typeof EvaluationsSelectColumn];
/** input type for updating data in table "evaluations" */
export type EvaluationsSetInput = {
  createdAt?: InputMaybe<Scalars['timestamp']['input']>;
  engineName?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  sfen?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamp']['input']>;
  variations?: InputMaybe<Scalars['jsonb']['input']>;
};

/** Streaming cursor of the table "evaluations" */
export type EvaluationsStreamCursorInput = {
  /** Stream column input with initial value */
  initialValue: EvaluationsStreamCursorValueInput;
  /** cursor ordering */
  ordering?: InputMaybe<CursorOrdering>;
};

/** Initial value of the column from where the streaming should start */
export type EvaluationsStreamCursorValueInput = {
  createdAt?: InputMaybe<Scalars['timestamp']['input']>;
  engineName?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  sfen?: InputMaybe<Scalars['String']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamp']['input']>;
  variations?: InputMaybe<Scalars['jsonb']['input']>;
};

/** update columns of table "evaluations" */
export const EvaluationsUpdateColumn = {
  /** column name */
  CreatedAt: 'createdAt',
  /** column name */
  EngineName: 'engineName',
  /** column name */
  Id: 'id',
  /** column name */
  Sfen: 'sfen',
  /** column name */
  UpdatedAt: 'updatedAt',
  /** column name */
  Variations: 'variations'
} as const;

export type EvaluationsUpdateColumn = typeof EvaluationsUpdateColumn[keyof typeof EvaluationsUpdateColumn];
export type EvaluationsUpdates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<EvaluationsAppendInput>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _deleteAtPath?: InputMaybe<EvaluationsDeleteAtPathInput>;
  /**
   * delete the array element with specified index (negative integers count from
   * the end). throws an error if top level container is not an array
   */
  _deleteElem?: InputMaybe<EvaluationsDeleteElemInput>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _deleteKey?: InputMaybe<EvaluationsDeleteKeyInput>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<EvaluationsPrependInput>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<EvaluationsSetInput>;
  /** filter the rows which have to be updated */
  where: EvaluationsBoolExp;
};

export type Health = {
  __typename?: 'Health';
  status: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
};

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type IntComparisonExp = {
  _eq?: InputMaybe<Scalars['Int']['input']>;
  _gt?: InputMaybe<Scalars['Int']['input']>;
  _gte?: InputMaybe<Scalars['Int']['input']>;
  _in?: InputMaybe<Array<Scalars['Int']['input']>>;
  _isNull?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Int']['input']>;
  _lte?: InputMaybe<Scalars['Int']['input']>;
  _neq?: InputMaybe<Scalars['Int']['input']>;
  _nin?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type JsonbCastExp = {
  String?: InputMaybe<StringComparisonExp>;
};

/** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
export type JsonbComparisonExp = {
  _cast?: InputMaybe<JsonbCastExp>;
  /** is the column contained in the given json value */
  _containedIn?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the column contain the given json value at the top level */
  _contains?: InputMaybe<Scalars['jsonb']['input']>;
  _eq?: InputMaybe<Scalars['jsonb']['input']>;
  _gt?: InputMaybe<Scalars['jsonb']['input']>;
  _gte?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the string exist as a top-level key in the column */
  _hasKey?: InputMaybe<Scalars['String']['input']>;
  /** do all of these strings exist as top-level keys in the column */
  _hasKeysAll?: InputMaybe<Array<Scalars['String']['input']>>;
  /** do any of these strings exist as top-level keys in the column */
  _hasKeysAny?: InputMaybe<Array<Scalars['String']['input']>>;
  _in?: InputMaybe<Array<Scalars['jsonb']['input']>>;
  _isNull?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['jsonb']['input']>;
  _lte?: InputMaybe<Scalars['jsonb']['input']>;
  _neq?: InputMaybe<Scalars['jsonb']['input']>;
  _nin?: InputMaybe<Array<Scalars['jsonb']['input']>>;
};

/** Markdownコンテンツ */
export type MarkdownContent = {
  __typename?: 'MarkdownContent';
  content: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

/** 対局情報 */
export type Match = {
  __typename?: 'Match';
  /** 作成日時 */
  createdAt: Scalars['String']['output'];
  /** 後手のプレイヤータイプ */
  goteType: Scalars['PlayerType']['output'];
  /** 対局ID */
  id: Scalars['String']['output'];
  /** 後手のプレイヤー名 */
  playerGote?: Maybe<Scalars['String']['output']>;
  /** 先手のプレイヤー名 */
  playerSente?: Maybe<Scalars['String']['output']>;
  /** 先手のプレイヤータイプ */
  senteType: Scalars['PlayerType']['output'];
  /** 対局状況 */
  status: Scalars['String']['output'];
  /** 更新日時 */
  updatedAt: Scalars['String']['output'];
};

/** 対局状態 */
export type MatchState = {
  __typename?: 'MatchState';
  /** 作成日時 */
  createdAt: Scalars['String']['output'];
  /** 局面番号 */
  index: Scalars['Int']['output'];
  /** 対局ID */
  matchId: Scalars['String']['output'];
  /** 盤面（SFEN形式） */
  sfen: Scalars['String']['output'];
  /** 消費時間（秒） */
  thinkingTime?: Maybe<Scalars['Int']['output']>;
  /** 指し手（USI形式） */
  usiMove?: Maybe<Scalars['String']['output']>;
};

/** columns and relationships of "match_states" */
export type MatchStates = {
  __typename?: 'MatchStates';
  createdAt: Scalars['timestamp']['output'];
  /** An object relationship */
  evaluation?: Maybe<Evaluations>;
  evaluationId?: Maybe<Scalars['String']['output']>;
  index: Scalars['Int']['output'];
  /** An object relationship */
  match: Matches;
  matchId: Scalars['String']['output'];
  sfen: Scalars['String']['output'];
  thinkingTime?: Maybe<Scalars['Int']['output']>;
  usiMove: Scalars['String']['output'];
};

/** order by aggregate values of table "match_states" */
export type MatchStatesAggregateOrderBy = {
  avg?: InputMaybe<MatchStatesAvgOrderBy>;
  count?: InputMaybe<OrderBy>;
  max?: InputMaybe<MatchStatesMaxOrderBy>;
  min?: InputMaybe<MatchStatesMinOrderBy>;
  stddev?: InputMaybe<MatchStatesStddevOrderBy>;
  stddevPop?: InputMaybe<MatchStatesStddevPopOrderBy>;
  stddevSamp?: InputMaybe<MatchStatesStddevSampOrderBy>;
  sum?: InputMaybe<MatchStatesSumOrderBy>;
  varPop?: InputMaybe<MatchStatesVarPopOrderBy>;
  varSamp?: InputMaybe<MatchStatesVarSampOrderBy>;
  variance?: InputMaybe<MatchStatesVarianceOrderBy>;
};

/** input type for inserting array relation for remote table "match_states" */
export type MatchStatesArrRelInsertInput = {
  data: Array<MatchStatesInsertInput>;
  /** upsert condition */
  onConflict?: InputMaybe<MatchStatesOnConflict>;
};

/** order by avg() on columns of table "match_states" */
export type MatchStatesAvgOrderBy = {
  index?: InputMaybe<OrderBy>;
  thinkingTime?: InputMaybe<OrderBy>;
};

/** Boolean expression to filter rows from the table "match_states". All fields are combined with a logical 'AND'. */
export type MatchStatesBoolExp = {
  _and?: InputMaybe<Array<MatchStatesBoolExp>>;
  _not?: InputMaybe<MatchStatesBoolExp>;
  _or?: InputMaybe<Array<MatchStatesBoolExp>>;
  createdAt?: InputMaybe<TimestampComparisonExp>;
  evaluation?: InputMaybe<EvaluationsBoolExp>;
  evaluationId?: InputMaybe<StringComparisonExp>;
  index?: InputMaybe<IntComparisonExp>;
  match?: InputMaybe<MatchesBoolExp>;
  matchId?: InputMaybe<StringComparisonExp>;
  sfen?: InputMaybe<StringComparisonExp>;
  thinkingTime?: InputMaybe<IntComparisonExp>;
  usiMove?: InputMaybe<StringComparisonExp>;
};

/** unique or primary key constraints on table "match_states" */
export const MatchStatesConstraint = {
  /** unique or primary key constraint on columns "index", "matchId" */
  MatchStatesPkey: 'match_states_pkey'
} as const;

export type MatchStatesConstraint = typeof MatchStatesConstraint[keyof typeof MatchStatesConstraint];
/** input type for incrementing numeric columns in table "match_states" */
export type MatchStatesIncInput = {
  index?: InputMaybe<Scalars['Int']['input']>;
  thinkingTime?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "match_states" */
export type MatchStatesInsertInput = {
  createdAt?: InputMaybe<Scalars['timestamp']['input']>;
  evaluation?: InputMaybe<EvaluationsObjRelInsertInput>;
  evaluationId?: InputMaybe<Scalars['String']['input']>;
  index?: InputMaybe<Scalars['Int']['input']>;
  match?: InputMaybe<MatchesObjRelInsertInput>;
  matchId?: InputMaybe<Scalars['String']['input']>;
  sfen?: InputMaybe<Scalars['String']['input']>;
  thinkingTime?: InputMaybe<Scalars['Int']['input']>;
  usiMove?: InputMaybe<Scalars['String']['input']>;
};

/** order by max() on columns of table "match_states" */
export type MatchStatesMaxOrderBy = {
  createdAt?: InputMaybe<OrderBy>;
  evaluationId?: InputMaybe<OrderBy>;
  index?: InputMaybe<OrderBy>;
  matchId?: InputMaybe<OrderBy>;
  sfen?: InputMaybe<OrderBy>;
  thinkingTime?: InputMaybe<OrderBy>;
  usiMove?: InputMaybe<OrderBy>;
};

/** order by min() on columns of table "match_states" */
export type MatchStatesMinOrderBy = {
  createdAt?: InputMaybe<OrderBy>;
  evaluationId?: InputMaybe<OrderBy>;
  index?: InputMaybe<OrderBy>;
  matchId?: InputMaybe<OrderBy>;
  sfen?: InputMaybe<OrderBy>;
  thinkingTime?: InputMaybe<OrderBy>;
  usiMove?: InputMaybe<OrderBy>;
};

/** response of any mutation on the table "match_states" */
export type MatchStatesMutationResponse = {
  __typename?: 'MatchStatesMutationResponse';
  /** number of rows affected by the mutation */
  affectedRows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<MatchStates>;
};

/** on_conflict condition type for table "match_states" */
export type MatchStatesOnConflict = {
  constraint: MatchStatesConstraint;
  updateColumns?: Array<MatchStatesUpdateColumn>;
  where?: InputMaybe<MatchStatesBoolExp>;
};

/** Ordering options when selecting data from "match_states". */
export type MatchStatesOrderBy = {
  createdAt?: InputMaybe<OrderBy>;
  evaluation?: InputMaybe<EvaluationsOrderBy>;
  evaluationId?: InputMaybe<OrderBy>;
  index?: InputMaybe<OrderBy>;
  match?: InputMaybe<MatchesOrderBy>;
  matchId?: InputMaybe<OrderBy>;
  sfen?: InputMaybe<OrderBy>;
  thinkingTime?: InputMaybe<OrderBy>;
  usiMove?: InputMaybe<OrderBy>;
};

/** primary key columns input for table: match_states */
export type MatchStatesPkColumnsInput = {
  index: Scalars['Int']['input'];
  matchId: Scalars['String']['input'];
};

/** select columns of table "match_states" */
export const MatchStatesSelectColumn = {
  /** column name */
  CreatedAt: 'createdAt',
  /** column name */
  EvaluationId: 'evaluationId',
  /** column name */
  Index: 'index',
  /** column name */
  MatchId: 'matchId',
  /** column name */
  Sfen: 'sfen',
  /** column name */
  ThinkingTime: 'thinkingTime',
  /** column name */
  UsiMove: 'usiMove'
} as const;

export type MatchStatesSelectColumn = typeof MatchStatesSelectColumn[keyof typeof MatchStatesSelectColumn];
/** input type for updating data in table "match_states" */
export type MatchStatesSetInput = {
  createdAt?: InputMaybe<Scalars['timestamp']['input']>;
  evaluationId?: InputMaybe<Scalars['String']['input']>;
  index?: InputMaybe<Scalars['Int']['input']>;
  matchId?: InputMaybe<Scalars['String']['input']>;
  sfen?: InputMaybe<Scalars['String']['input']>;
  thinkingTime?: InputMaybe<Scalars['Int']['input']>;
  usiMove?: InputMaybe<Scalars['String']['input']>;
};

/** order by stddev() on columns of table "match_states" */
export type MatchStatesStddevOrderBy = {
  index?: InputMaybe<OrderBy>;
  thinkingTime?: InputMaybe<OrderBy>;
};

/** order by stddevPop() on columns of table "match_states" */
export type MatchStatesStddevPopOrderBy = {
  index?: InputMaybe<OrderBy>;
  thinkingTime?: InputMaybe<OrderBy>;
};

/** order by stddevSamp() on columns of table "match_states" */
export type MatchStatesStddevSampOrderBy = {
  index?: InputMaybe<OrderBy>;
  thinkingTime?: InputMaybe<OrderBy>;
};

/** Streaming cursor of the table "match_states" */
export type MatchStatesStreamCursorInput = {
  /** Stream column input with initial value */
  initialValue: MatchStatesStreamCursorValueInput;
  /** cursor ordering */
  ordering?: InputMaybe<CursorOrdering>;
};

/** Initial value of the column from where the streaming should start */
export type MatchStatesStreamCursorValueInput = {
  createdAt?: InputMaybe<Scalars['timestamp']['input']>;
  evaluationId?: InputMaybe<Scalars['String']['input']>;
  index?: InputMaybe<Scalars['Int']['input']>;
  matchId?: InputMaybe<Scalars['String']['input']>;
  sfen?: InputMaybe<Scalars['String']['input']>;
  thinkingTime?: InputMaybe<Scalars['Int']['input']>;
  usiMove?: InputMaybe<Scalars['String']['input']>;
};

/** order by sum() on columns of table "match_states" */
export type MatchStatesSumOrderBy = {
  index?: InputMaybe<OrderBy>;
  thinkingTime?: InputMaybe<OrderBy>;
};

/** update columns of table "match_states" */
export const MatchStatesUpdateColumn = {
  /** column name */
  CreatedAt: 'createdAt',
  /** column name */
  EvaluationId: 'evaluationId',
  /** column name */
  Index: 'index',
  /** column name */
  MatchId: 'matchId',
  /** column name */
  Sfen: 'sfen',
  /** column name */
  ThinkingTime: 'thinkingTime',
  /** column name */
  UsiMove: 'usiMove'
} as const;

export type MatchStatesUpdateColumn = typeof MatchStatesUpdateColumn[keyof typeof MatchStatesUpdateColumn];
export type MatchStatesUpdates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<MatchStatesIncInput>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<MatchStatesSetInput>;
  /** filter the rows which have to be updated */
  where: MatchStatesBoolExp;
};

/** order by varPop() on columns of table "match_states" */
export type MatchStatesVarPopOrderBy = {
  index?: InputMaybe<OrderBy>;
  thinkingTime?: InputMaybe<OrderBy>;
};

/** order by varSamp() on columns of table "match_states" */
export type MatchStatesVarSampOrderBy = {
  index?: InputMaybe<OrderBy>;
  thinkingTime?: InputMaybe<OrderBy>;
};

/** order by variance() on columns of table "match_states" */
export type MatchStatesVarianceOrderBy = {
  index?: InputMaybe<OrderBy>;
  thinkingTime?: InputMaybe<OrderBy>;
};

/** Boolean expression to compare columns of type "MatchStatus". All fields are combined with logical 'AND'. */
export type MatchStatusComparisonExp = {
  _eq?: InputMaybe<Scalars['MatchStatus']['input']>;
  _gt?: InputMaybe<Scalars['MatchStatus']['input']>;
  _gte?: InputMaybe<Scalars['MatchStatus']['input']>;
  _in?: InputMaybe<Array<Scalars['MatchStatus']['input']>>;
  _isNull?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['MatchStatus']['input']>;
  _lte?: InputMaybe<Scalars['MatchStatus']['input']>;
  _neq?: InputMaybe<Scalars['MatchStatus']['input']>;
  _nin?: InputMaybe<Array<Scalars['MatchStatus']['input']>>;
};

/** columns and relationships of "matches" */
export type Matches = {
  __typename?: 'Matches';
  /** An array relationship */
  chatMessages: Array<ChatMessages>;
  createdAt: Scalars['timestamp']['output'];
  goteType: Scalars['PlayerType']['output'];
  id: Scalars['String']['output'];
  /** An array relationship */
  matchStates: Array<MatchStates>;
  playerGote?: Maybe<Scalars['String']['output']>;
  playerSente?: Maybe<Scalars['String']['output']>;
  senteType: Scalars['PlayerType']['output'];
  status: Scalars['MatchStatus']['output'];
  updatedAt: Scalars['timestamp']['output'];
};


/** columns and relationships of "matches" */
export type MatchesChatMessagesArgs = {
  distinctOn?: InputMaybe<Array<ChatMessagesSelectColumn>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ChatMessagesOrderBy>>;
  where?: InputMaybe<ChatMessagesBoolExp>;
};


/** columns and relationships of "matches" */
export type MatchesMatchStatesArgs = {
  distinctOn?: InputMaybe<Array<MatchStatesSelectColumn>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<MatchStatesOrderBy>>;
  where?: InputMaybe<MatchStatesBoolExp>;
};

/** Boolean expression to filter rows from the table "matches". All fields are combined with a logical 'AND'. */
export type MatchesBoolExp = {
  _and?: InputMaybe<Array<MatchesBoolExp>>;
  _not?: InputMaybe<MatchesBoolExp>;
  _or?: InputMaybe<Array<MatchesBoolExp>>;
  chatMessages?: InputMaybe<ChatMessagesBoolExp>;
  createdAt?: InputMaybe<TimestampComparisonExp>;
  goteType?: InputMaybe<PlayerTypeComparisonExp>;
  id?: InputMaybe<StringComparisonExp>;
  matchStates?: InputMaybe<MatchStatesBoolExp>;
  playerGote?: InputMaybe<StringComparisonExp>;
  playerSente?: InputMaybe<StringComparisonExp>;
  senteType?: InputMaybe<PlayerTypeComparisonExp>;
  status?: InputMaybe<MatchStatusComparisonExp>;
  updatedAt?: InputMaybe<TimestampComparisonExp>;
};

/** unique or primary key constraints on table "matches" */
export const MatchesConstraint = {
  /** unique or primary key constraint on columns "id" */
  MatchesPkey: 'matches_pkey'
} as const;

export type MatchesConstraint = typeof MatchesConstraint[keyof typeof MatchesConstraint];
/** input type for inserting data into table "matches" */
export type MatchesInsertInput = {
  chatMessages?: InputMaybe<ChatMessagesArrRelInsertInput>;
  createdAt?: InputMaybe<Scalars['timestamp']['input']>;
  goteType?: InputMaybe<Scalars['PlayerType']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  matchStates?: InputMaybe<MatchStatesArrRelInsertInput>;
  playerGote?: InputMaybe<Scalars['String']['input']>;
  playerSente?: InputMaybe<Scalars['String']['input']>;
  senteType?: InputMaybe<Scalars['PlayerType']['input']>;
  status?: InputMaybe<Scalars['MatchStatus']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamp']['input']>;
};

/** response of any mutation on the table "matches" */
export type MatchesMutationResponse = {
  __typename?: 'MatchesMutationResponse';
  /** number of rows affected by the mutation */
  affectedRows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Matches>;
};

/** input type for inserting object relation for remote table "matches" */
export type MatchesObjRelInsertInput = {
  data: MatchesInsertInput;
  /** upsert condition */
  onConflict?: InputMaybe<MatchesOnConflict>;
};

/** on_conflict condition type for table "matches" */
export type MatchesOnConflict = {
  constraint: MatchesConstraint;
  updateColumns?: Array<MatchesUpdateColumn>;
  where?: InputMaybe<MatchesBoolExp>;
};

/** Ordering options when selecting data from "matches". */
export type MatchesOrderBy = {
  chatMessagesAggregate?: InputMaybe<ChatMessagesAggregateOrderBy>;
  createdAt?: InputMaybe<OrderBy>;
  goteType?: InputMaybe<OrderBy>;
  id?: InputMaybe<OrderBy>;
  matchStatesAggregate?: InputMaybe<MatchStatesAggregateOrderBy>;
  playerGote?: InputMaybe<OrderBy>;
  playerSente?: InputMaybe<OrderBy>;
  senteType?: InputMaybe<OrderBy>;
  status?: InputMaybe<OrderBy>;
  updatedAt?: InputMaybe<OrderBy>;
};

/** primary key columns input for table: matches */
export type MatchesPkColumnsInput = {
  id: Scalars['String']['input'];
};

/** select columns of table "matches" */
export const MatchesSelectColumn = {
  /** column name */
  CreatedAt: 'createdAt',
  /** column name */
  GoteType: 'goteType',
  /** column name */
  Id: 'id',
  /** column name */
  PlayerGote: 'playerGote',
  /** column name */
  PlayerSente: 'playerSente',
  /** column name */
  SenteType: 'senteType',
  /** column name */
  Status: 'status',
  /** column name */
  UpdatedAt: 'updatedAt'
} as const;

export type MatchesSelectColumn = typeof MatchesSelectColumn[keyof typeof MatchesSelectColumn];
/** input type for updating data in table "matches" */
export type MatchesSetInput = {
  createdAt?: InputMaybe<Scalars['timestamp']['input']>;
  goteType?: InputMaybe<Scalars['PlayerType']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  playerGote?: InputMaybe<Scalars['String']['input']>;
  playerSente?: InputMaybe<Scalars['String']['input']>;
  senteType?: InputMaybe<Scalars['PlayerType']['input']>;
  status?: InputMaybe<Scalars['MatchStatus']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamp']['input']>;
};

/** Streaming cursor of the table "matches" */
export type MatchesStreamCursorInput = {
  /** Stream column input with initial value */
  initialValue: MatchesStreamCursorValueInput;
  /** cursor ordering */
  ordering?: InputMaybe<CursorOrdering>;
};

/** Initial value of the column from where the streaming should start */
export type MatchesStreamCursorValueInput = {
  createdAt?: InputMaybe<Scalars['timestamp']['input']>;
  goteType?: InputMaybe<Scalars['PlayerType']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  playerGote?: InputMaybe<Scalars['String']['input']>;
  playerSente?: InputMaybe<Scalars['String']['input']>;
  senteType?: InputMaybe<Scalars['PlayerType']['input']>;
  status?: InputMaybe<Scalars['MatchStatus']['input']>;
  updatedAt?: InputMaybe<Scalars['timestamp']['input']>;
};

/** update columns of table "matches" */
export const MatchesUpdateColumn = {
  /** column name */
  CreatedAt: 'createdAt',
  /** column name */
  GoteType: 'goteType',
  /** column name */
  Id: 'id',
  /** column name */
  PlayerGote: 'playerGote',
  /** column name */
  PlayerSente: 'playerSente',
  /** column name */
  SenteType: 'senteType',
  /** column name */
  Status: 'status',
  /** column name */
  UpdatedAt: 'updatedAt'
} as const;

export type MatchesUpdateColumn = typeof MatchesUpdateColumn[keyof typeof MatchesUpdateColumn];
export type MatchesUpdates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<MatchesSetInput>;
  /** filter the rows which have to be updated */
  where: MatchesBoolExp;
};

/** メッセージコンテンツのUnion型 */
export type MessageContent = BestMoveContent | MarkdownContent;

/** Boolean expression to compare columns of type "MessageRole". All fields are combined with logical 'AND'. */
export type MessageRoleComparisonExp = {
  _eq?: InputMaybe<Scalars['MessageRole']['input']>;
  _gt?: InputMaybe<Scalars['MessageRole']['input']>;
  _gte?: InputMaybe<Scalars['MessageRole']['input']>;
  _in?: InputMaybe<Array<Scalars['MessageRole']['input']>>;
  _isNull?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['MessageRole']['input']>;
  _lte?: InputMaybe<Scalars['MessageRole']['input']>;
  _neq?: InputMaybe<Scalars['MessageRole']['input']>;
  _nin?: InputMaybe<Array<Scalars['MessageRole']['input']>>;
};

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
  evaluateMatchState: EvaluateMatchStateResult;
  sendChatMessage: SendChatMessageResult;
  startMatch: Match;
};


export type MutationEvaluateMatchStateArgs = {
  input: EvaluateMatchStateInput;
};


export type MutationSendChatMessageArgs = {
  input: SendChatMessageInput;
};


export type MutationStartMatchArgs = {
  input: StartMatchInput;
};

/** column ordering options */
export const OrderBy = {
  /** in ascending order, nulls last */
  Asc: 'ASC',
  /** in ascending order, nulls first */
  AscNullsFirst: 'ASC_NULLS_FIRST',
  /** in ascending order, nulls last */
  AscNullsLast: 'ASC_NULLS_LAST',
  /** in descending order, nulls first */
  Desc: 'DESC',
  /** in descending order, nulls first */
  DescNullsFirst: 'DESC_NULLS_FIRST',
  /** in descending order, nulls last */
  DescNullsLast: 'DESC_NULLS_LAST'
} as const;

export type OrderBy = typeof OrderBy[keyof typeof OrderBy];
/** Boolean expression to compare columns of type "PlayerType". All fields are combined with logical 'AND'. */
export type PlayerTypeComparisonExp = {
  _eq?: InputMaybe<Scalars['PlayerType']['input']>;
  _gt?: InputMaybe<Scalars['PlayerType']['input']>;
  _gte?: InputMaybe<Scalars['PlayerType']['input']>;
  _in?: InputMaybe<Array<Scalars['PlayerType']['input']>>;
  _isNull?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['PlayerType']['input']>;
  _lte?: InputMaybe<Scalars['PlayerType']['input']>;
  _neq?: InputMaybe<Scalars['PlayerType']['input']>;
  _nin?: InputMaybe<Array<Scalars['PlayerType']['input']>>;
};

export type Query = {
  __typename?: 'Query';
  health: Health;
};

/** チャットメッセージ送信リクエスト */
export type SendChatMessageInput = {
  /** AIのパーソナリティ設定 */
  aiPersonality?: InputMaybe<AiPromptPersonality>;
  /** メッセージ内容 */
  content: Scalars['String']['input'];
  /** 対局ID */
  matchId: Scalars['String']['input'];
};

/** チャットメッセージ送信結果 */
export type SendChatMessageResult = {
  __typename?: 'SendChatMessageResult';
  /** 送信成功フラグ */
  success: Scalars['Boolean']['output'];
};

/** 対局作成リクエスト */
export type StartMatchInput = {
  /** 後手のプレイヤータイプ */
  goteType: Scalars['PlayerType']['input'];
  /** 対局ID（指定しない場合は自動生成） */
  id?: InputMaybe<Scalars['String']['input']>;
  /** 後手のプレイヤー名 */
  playerGote?: InputMaybe<Scalars['String']['input']>;
  /** 先手のプレイヤー名 */
  playerSente?: InputMaybe<Scalars['String']['input']>;
  /** 先手のプレイヤータイプ */
  senteType: Scalars['PlayerType']['input'];
  /** 初期盤面（SFEN形式、指定しない場合は平手の初期盤面） */
  sfen?: InputMaybe<Scalars['String']['input']>;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type StringComparisonExp = {
  _eq?: InputMaybe<Scalars['String']['input']>;
  _gt?: InputMaybe<Scalars['String']['input']>;
  _gte?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars['String']['input']>;
  _in?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars['String']['input']>;
  _isNull?: InputMaybe<Scalars['Boolean']['input']>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars['String']['input']>;
  _lt?: InputMaybe<Scalars['String']['input']>;
  _lte?: InputMaybe<Scalars['String']['input']>;
  _neq?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars['String']['input']>;
  _nin?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars['String']['input']>;
};

/** Boolean expression to compare columns of type "timestamp". All fields are combined with logical 'AND'. */
export type TimestampComparisonExp = {
  _eq?: InputMaybe<Scalars['timestamp']['input']>;
  _gt?: InputMaybe<Scalars['timestamp']['input']>;
  _gte?: InputMaybe<Scalars['timestamp']['input']>;
  _in?: InputMaybe<Array<Scalars['timestamp']['input']>>;
  _isNull?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timestamp']['input']>;
  _lte?: InputMaybe<Scalars['timestamp']['input']>;
  _neq?: InputMaybe<Scalars['timestamp']['input']>;
  _nin?: InputMaybe<Array<Scalars['timestamp']['input']>>;
};

/** mutation root */
export type Mutation_Root = {
  __typename?: 'mutation_root';
  /** delete data from the table: "chat_messages" */
  deleteChatMessages?: Maybe<ChatMessagesMutationResponse>;
  /** delete single row from the table: "chat_messages" */
  deleteChatMessagesByPk?: Maybe<ChatMessages>;
  /** delete data from the table: "evaluations" */
  deleteEvaluations?: Maybe<EvaluationsMutationResponse>;
  /** delete single row from the table: "evaluations" */
  deleteEvaluationsByPk?: Maybe<Evaluations>;
  /** delete data from the table: "match_states" */
  deleteMatchStates?: Maybe<MatchStatesMutationResponse>;
  /** delete single row from the table: "match_states" */
  deleteMatchStatesByPk?: Maybe<MatchStates>;
  /** delete data from the table: "matches" */
  deleteMatches?: Maybe<MatchesMutationResponse>;
  /** delete single row from the table: "matches" */
  deleteMatchesByPk?: Maybe<Matches>;
  evaluateMatchState: EvaluateMatchStateResult;
  /** insert data into the table: "chat_messages" */
  insertChatMessages?: Maybe<ChatMessagesMutationResponse>;
  /** insert a single row into the table: "chat_messages" */
  insertChatMessagesOne?: Maybe<ChatMessages>;
  /** insert data into the table: "evaluations" */
  insertEvaluations?: Maybe<EvaluationsMutationResponse>;
  /** insert a single row into the table: "evaluations" */
  insertEvaluationsOne?: Maybe<Evaluations>;
  /** insert data into the table: "match_states" */
  insertMatchStates?: Maybe<MatchStatesMutationResponse>;
  /** insert a single row into the table: "match_states" */
  insertMatchStatesOne?: Maybe<MatchStates>;
  /** insert data into the table: "matches" */
  insertMatches?: Maybe<MatchesMutationResponse>;
  /** insert a single row into the table: "matches" */
  insertMatchesOne?: Maybe<Matches>;
  sendChatMessage: SendChatMessageResult;
  startMatch: Match;
  /** update data of the table: "chat_messages" */
  updateChatMessages?: Maybe<ChatMessagesMutationResponse>;
  /** update single row of the table: "chat_messages" */
  updateChatMessagesByPk?: Maybe<ChatMessages>;
  /** update multiples rows of table: "chat_messages" */
  updateChatMessagesMany?: Maybe<Array<Maybe<ChatMessagesMutationResponse>>>;
  /** update data of the table: "evaluations" */
  updateEvaluations?: Maybe<EvaluationsMutationResponse>;
  /** update single row of the table: "evaluations" */
  updateEvaluationsByPk?: Maybe<Evaluations>;
  /** update multiples rows of table: "evaluations" */
  updateEvaluationsMany?: Maybe<Array<Maybe<EvaluationsMutationResponse>>>;
  /** update data of the table: "match_states" */
  updateMatchStates?: Maybe<MatchStatesMutationResponse>;
  /** update single row of the table: "match_states" */
  updateMatchStatesByPk?: Maybe<MatchStates>;
  /** update multiples rows of table: "match_states" */
  updateMatchStatesMany?: Maybe<Array<Maybe<MatchStatesMutationResponse>>>;
  /** update data of the table: "matches" */
  updateMatches?: Maybe<MatchesMutationResponse>;
  /** update single row of the table: "matches" */
  updateMatchesByPk?: Maybe<Matches>;
  /** update multiples rows of table: "matches" */
  updateMatchesMany?: Maybe<Array<Maybe<MatchesMutationResponse>>>;
};


/** mutation root */
export type Mutation_RootDeleteChatMessagesArgs = {
  where: ChatMessagesBoolExp;
};


/** mutation root */
export type Mutation_RootDeleteChatMessagesByPkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDeleteEvaluationsArgs = {
  where: EvaluationsBoolExp;
};


/** mutation root */
export type Mutation_RootDeleteEvaluationsByPkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDeleteMatchStatesArgs = {
  where: MatchStatesBoolExp;
};


/** mutation root */
export type Mutation_RootDeleteMatchStatesByPkArgs = {
  index: Scalars['Int']['input'];
  matchId: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDeleteMatchesArgs = {
  where: MatchesBoolExp;
};


/** mutation root */
export type Mutation_RootDeleteMatchesByPkArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootEvaluateMatchStateArgs = {
  input: EvaluateMatchStateInput;
};


/** mutation root */
export type Mutation_RootInsertChatMessagesArgs = {
  objects: Array<ChatMessagesInsertInput>;
  onConflict?: InputMaybe<ChatMessagesOnConflict>;
};


/** mutation root */
export type Mutation_RootInsertChatMessagesOneArgs = {
  object: ChatMessagesInsertInput;
  onConflict?: InputMaybe<ChatMessagesOnConflict>;
};


/** mutation root */
export type Mutation_RootInsertEvaluationsArgs = {
  objects: Array<EvaluationsInsertInput>;
  onConflict?: InputMaybe<EvaluationsOnConflict>;
};


/** mutation root */
export type Mutation_RootInsertEvaluationsOneArgs = {
  object: EvaluationsInsertInput;
  onConflict?: InputMaybe<EvaluationsOnConflict>;
};


/** mutation root */
export type Mutation_RootInsertMatchStatesArgs = {
  objects: Array<MatchStatesInsertInput>;
  onConflict?: InputMaybe<MatchStatesOnConflict>;
};


/** mutation root */
export type Mutation_RootInsertMatchStatesOneArgs = {
  object: MatchStatesInsertInput;
  onConflict?: InputMaybe<MatchStatesOnConflict>;
};


/** mutation root */
export type Mutation_RootInsertMatchesArgs = {
  objects: Array<MatchesInsertInput>;
  onConflict?: InputMaybe<MatchesOnConflict>;
};


/** mutation root */
export type Mutation_RootInsertMatchesOneArgs = {
  object: MatchesInsertInput;
  onConflict?: InputMaybe<MatchesOnConflict>;
};


/** mutation root */
export type Mutation_RootSendChatMessageArgs = {
  input: SendChatMessageInput;
};


/** mutation root */
export type Mutation_RootStartMatchArgs = {
  input: StartMatchInput;
};


/** mutation root */
export type Mutation_RootUpdateChatMessagesArgs = {
  _append?: InputMaybe<ChatMessagesAppendInput>;
  _deleteAtPath?: InputMaybe<ChatMessagesDeleteAtPathInput>;
  _deleteElem?: InputMaybe<ChatMessagesDeleteElemInput>;
  _deleteKey?: InputMaybe<ChatMessagesDeleteKeyInput>;
  _prepend?: InputMaybe<ChatMessagesPrependInput>;
  _set?: InputMaybe<ChatMessagesSetInput>;
  where: ChatMessagesBoolExp;
};


/** mutation root */
export type Mutation_RootUpdateChatMessagesByPkArgs = {
  _append?: InputMaybe<ChatMessagesAppendInput>;
  _deleteAtPath?: InputMaybe<ChatMessagesDeleteAtPathInput>;
  _deleteElem?: InputMaybe<ChatMessagesDeleteElemInput>;
  _deleteKey?: InputMaybe<ChatMessagesDeleteKeyInput>;
  _prepend?: InputMaybe<ChatMessagesPrependInput>;
  _set?: InputMaybe<ChatMessagesSetInput>;
  pkColumns: ChatMessagesPkColumnsInput;
};


/** mutation root */
export type Mutation_RootUpdateChatMessagesManyArgs = {
  updates: Array<ChatMessagesUpdates>;
};


/** mutation root */
export type Mutation_RootUpdateEvaluationsArgs = {
  _append?: InputMaybe<EvaluationsAppendInput>;
  _deleteAtPath?: InputMaybe<EvaluationsDeleteAtPathInput>;
  _deleteElem?: InputMaybe<EvaluationsDeleteElemInput>;
  _deleteKey?: InputMaybe<EvaluationsDeleteKeyInput>;
  _prepend?: InputMaybe<EvaluationsPrependInput>;
  _set?: InputMaybe<EvaluationsSetInput>;
  where: EvaluationsBoolExp;
};


/** mutation root */
export type Mutation_RootUpdateEvaluationsByPkArgs = {
  _append?: InputMaybe<EvaluationsAppendInput>;
  _deleteAtPath?: InputMaybe<EvaluationsDeleteAtPathInput>;
  _deleteElem?: InputMaybe<EvaluationsDeleteElemInput>;
  _deleteKey?: InputMaybe<EvaluationsDeleteKeyInput>;
  _prepend?: InputMaybe<EvaluationsPrependInput>;
  _set?: InputMaybe<EvaluationsSetInput>;
  pkColumns: EvaluationsPkColumnsInput;
};


/** mutation root */
export type Mutation_RootUpdateEvaluationsManyArgs = {
  updates: Array<EvaluationsUpdates>;
};


/** mutation root */
export type Mutation_RootUpdateMatchStatesArgs = {
  _inc?: InputMaybe<MatchStatesIncInput>;
  _set?: InputMaybe<MatchStatesSetInput>;
  where: MatchStatesBoolExp;
};


/** mutation root */
export type Mutation_RootUpdateMatchStatesByPkArgs = {
  _inc?: InputMaybe<MatchStatesIncInput>;
  _set?: InputMaybe<MatchStatesSetInput>;
  pkColumns: MatchStatesPkColumnsInput;
};


/** mutation root */
export type Mutation_RootUpdateMatchStatesManyArgs = {
  updates: Array<MatchStatesUpdates>;
};


/** mutation root */
export type Mutation_RootUpdateMatchesArgs = {
  _set?: InputMaybe<MatchesSetInput>;
  where: MatchesBoolExp;
};


/** mutation root */
export type Mutation_RootUpdateMatchesByPkArgs = {
  _set?: InputMaybe<MatchesSetInput>;
  pkColumns: MatchesPkColumnsInput;
};


/** mutation root */
export type Mutation_RootUpdateMatchesManyArgs = {
  updates: Array<MatchesUpdates>;
};

export type Query_Root = {
  __typename?: 'query_root';
  /** An array relationship */
  chatMessages: Array<ChatMessages>;
  /** fetch data from the table: "chat_messages" using primary key columns */
  chatMessagesByPk?: Maybe<ChatMessages>;
  /** fetch data from the table: "evaluations" */
  evaluations: Array<Evaluations>;
  /** fetch data from the table: "evaluations" using primary key columns */
  evaluationsByPk?: Maybe<Evaluations>;
  health: Health;
  /** An array relationship */
  matchStates: Array<MatchStates>;
  /** fetch data from the table: "match_states" using primary key columns */
  matchStatesByPk?: Maybe<MatchStates>;
  /** fetch data from the table: "matches" */
  matches: Array<Matches>;
  /** fetch data from the table: "matches" using primary key columns */
  matchesByPk?: Maybe<Matches>;
};


export type Query_RootChatMessagesArgs = {
  distinctOn?: InputMaybe<Array<ChatMessagesSelectColumn>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ChatMessagesOrderBy>>;
  where?: InputMaybe<ChatMessagesBoolExp>;
};


export type Query_RootChatMessagesByPkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootEvaluationsArgs = {
  distinctOn?: InputMaybe<Array<EvaluationsSelectColumn>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<EvaluationsOrderBy>>;
  where?: InputMaybe<EvaluationsBoolExp>;
};


export type Query_RootEvaluationsByPkArgs = {
  id: Scalars['String']['input'];
};


export type Query_RootMatchStatesArgs = {
  distinctOn?: InputMaybe<Array<MatchStatesSelectColumn>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<MatchStatesOrderBy>>;
  where?: InputMaybe<MatchStatesBoolExp>;
};


export type Query_RootMatchStatesByPkArgs = {
  index: Scalars['Int']['input'];
  matchId: Scalars['String']['input'];
};


export type Query_RootMatchesArgs = {
  distinctOn?: InputMaybe<Array<MatchesSelectColumn>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<MatchesOrderBy>>;
  where?: InputMaybe<MatchesBoolExp>;
};


export type Query_RootMatchesByPkArgs = {
  id: Scalars['String']['input'];
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  /** An array relationship */
  chatMessages: Array<ChatMessages>;
  /** fetch data from the table: "chat_messages" using primary key columns */
  chatMessagesByPk?: Maybe<ChatMessages>;
  /** fetch data from the table in a streaming manner: "chat_messages" */
  chatMessagesStream: Array<ChatMessages>;
  /** fetch data from the table: "evaluations" */
  evaluations: Array<Evaluations>;
  /** fetch data from the table: "evaluations" using primary key columns */
  evaluationsByPk?: Maybe<Evaluations>;
  /** fetch data from the table in a streaming manner: "evaluations" */
  evaluationsStream: Array<Evaluations>;
  /** An array relationship */
  matchStates: Array<MatchStates>;
  /** fetch data from the table: "match_states" using primary key columns */
  matchStatesByPk?: Maybe<MatchStates>;
  /** fetch data from the table in a streaming manner: "match_states" */
  matchStatesStream: Array<MatchStates>;
  /** fetch data from the table: "matches" */
  matches: Array<Matches>;
  /** fetch data from the table: "matches" using primary key columns */
  matchesByPk?: Maybe<Matches>;
  /** fetch data from the table in a streaming manner: "matches" */
  matchesStream: Array<Matches>;
};


export type Subscription_RootChatMessagesArgs = {
  distinctOn?: InputMaybe<Array<ChatMessagesSelectColumn>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ChatMessagesOrderBy>>;
  where?: InputMaybe<ChatMessagesBoolExp>;
};


export type Subscription_RootChatMessagesByPkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootChatMessagesStreamArgs = {
  batchSize: Scalars['Int']['input'];
  cursor: Array<InputMaybe<ChatMessagesStreamCursorInput>>;
  where?: InputMaybe<ChatMessagesBoolExp>;
};


export type Subscription_RootEvaluationsArgs = {
  distinctOn?: InputMaybe<Array<EvaluationsSelectColumn>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<EvaluationsOrderBy>>;
  where?: InputMaybe<EvaluationsBoolExp>;
};


export type Subscription_RootEvaluationsByPkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootEvaluationsStreamArgs = {
  batchSize: Scalars['Int']['input'];
  cursor: Array<InputMaybe<EvaluationsStreamCursorInput>>;
  where?: InputMaybe<EvaluationsBoolExp>;
};


export type Subscription_RootMatchStatesArgs = {
  distinctOn?: InputMaybe<Array<MatchStatesSelectColumn>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<MatchStatesOrderBy>>;
  where?: InputMaybe<MatchStatesBoolExp>;
};


export type Subscription_RootMatchStatesByPkArgs = {
  index: Scalars['Int']['input'];
  matchId: Scalars['String']['input'];
};


export type Subscription_RootMatchStatesStreamArgs = {
  batchSize: Scalars['Int']['input'];
  cursor: Array<InputMaybe<MatchStatesStreamCursorInput>>;
  where?: InputMaybe<MatchStatesBoolExp>;
};


export type Subscription_RootMatchesArgs = {
  distinctOn?: InputMaybe<Array<MatchesSelectColumn>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<MatchesOrderBy>>;
  where?: InputMaybe<MatchesBoolExp>;
};


export type Subscription_RootMatchesByPkArgs = {
  id: Scalars['String']['input'];
};


export type Subscription_RootMatchesStreamArgs = {
  batchSize: Scalars['Int']['input'];
  cursor: Array<InputMaybe<MatchesStreamCursorInput>>;
  where?: InputMaybe<MatchesBoolExp>;
};

export type HealthQueryVariables = Exact<{ [key: string]: never; }>;


export type HealthQuery = { __typename?: 'query_root', health: { __typename?: 'Health', status: string, timestamp: string } };

export type GetMatchesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMatchesQuery = { __typename?: 'query_root', matches: Array<{ __typename?: 'Matches', id: string, createdAt: string, updatedAt: string, status: 'ONGOING' | 'COMPLETED' | 'ABANDONED', playerSente?: string | null | undefined, playerGote?: string | null | undefined, senteType: 'HUMAN' | 'AI', goteType: 'HUMAN' | 'AI', matchStates: Array<{ __typename?: 'MatchStates', createdAt: string, matchId: string, index: number, usiMove: string, sfen: string, thinkingTime?: number | null | undefined }>, chatMessages: Array<{ __typename?: 'ChatMessages', id: string, createdAt: string, matchId: string, role: 'USER' | 'ASSISTANT', contents: any, metadata?: string | null | undefined }> }> };

export type GetMatchQueryVariables = Exact<{
  matchId: Scalars['String']['input'];
}>;


export type GetMatchQuery = { __typename?: 'query_root', matchesByPk?: { __typename?: 'Matches', id: string, createdAt: string, updatedAt: string, status: 'ONGOING' | 'COMPLETED' | 'ABANDONED', playerSente?: string | null | undefined, playerGote?: string | null | undefined, senteType: 'HUMAN' | 'AI', goteType: 'HUMAN' | 'AI', matchStates: Array<{ __typename?: 'MatchStates', createdAt: string, matchId: string, index: number, usiMove: string, sfen: string, thinkingTime?: number | null | undefined }> } | null | undefined };

export type GetChatMessagesQueryVariables = Exact<{
  matchId: Scalars['String']['input'];
}>;


export type GetChatMessagesQuery = { __typename?: 'query_root', chatMessages: Array<{ __typename?: 'ChatMessages', id: string, createdAt: string, matchId: string, role: 'USER' | 'ASSISTANT', contents: any, metadata?: string | null | undefined }> };

export type SubscribeChatMessagesSubscriptionVariables = Exact<{
  matchId: Scalars['String']['input'];
}>;


export type SubscribeChatMessagesSubscription = { __typename?: 'subscription_root', chatMessages: Array<{ __typename?: 'ChatMessages', id: string, createdAt: string, matchId: string, role: 'USER' | 'ASSISTANT', contents: any, metadata?: string | null | undefined, isPartial: boolean }> };

export type SubscribeMatchStatesSubscriptionVariables = Exact<{
  matchId: Scalars['String']['input'];
}>;


export type SubscribeMatchStatesSubscription = { __typename?: 'subscription_root', matchStates: Array<{ __typename?: 'MatchStates', createdAt: string, matchId: string, index: number, usiMove: string, sfen: string, thinkingTime?: number | null | undefined, evaluation?: { __typename?: 'Evaluations', id: string, sfen: string, engineName: string, variations: any, createdAt: string, updatedAt: string } | null | undefined }> };

export type StartMatchMutationVariables = Exact<{
  id?: InputMaybe<Scalars['String']['input']>;
  playerSente?: InputMaybe<Scalars['String']['input']>;
  playerGote?: InputMaybe<Scalars['String']['input']>;
  senteType: Scalars['PlayerType']['input'];
  goteType: Scalars['PlayerType']['input'];
}>;


export type StartMatchMutation = { __typename?: 'mutation_root', startMatch: { __typename?: 'Match', id: string, createdAt: string, updatedAt: string, status: string, playerSente?: string | null | undefined, playerGote?: string | null | undefined, senteType: 'HUMAN' | 'AI', goteType: 'HUMAN' | 'AI' } };

export type SendChatMessageMutationVariables = Exact<{
  matchId: Scalars['String']['input'];
  content: Scalars['String']['input'];
  aiPersonality?: InputMaybe<AiPromptPersonality>;
}>;


export type SendChatMessageMutation = { __typename?: 'mutation_root', sendChatMessage: { __typename?: 'SendChatMessageResult', success: boolean } };

export type EvaluateMatchStateMutationVariables = Exact<{
  input: EvaluateMatchStateInput;
}>;


export type EvaluateMatchStateMutation = { __typename?: 'mutation_root', evaluateMatchState: { __typename?: 'EvaluateMatchStateResult', type: string, bestmove: string, timeMs: number, engineName: string, variations: Array<{ __typename?: 'MoveVariation', move: string, scoreCp?: number | null | undefined, scoreMate?: number | null | undefined, depth: number, nodes?: number | null | undefined, pv?: Array<string> | null | undefined }> } };


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
  matches(orderBy: {createdAt: DESC}) {
    id
    createdAt
    updatedAt
    status
    playerSente
    playerGote
    senteType
    goteType
    matchStates(orderBy: {index: ASC}) {
      createdAt
      matchId
      index
      usiMove
      sfen
      thinkingTime
    }
    chatMessages(orderBy: {createdAt: ASC}) {
      id
      createdAt
      matchId
      role
      contents
      metadata
    }
  }
}
    `;

export function useGetMatchesQuery(options?: Omit<Urql.UseQueryArgs<GetMatchesQueryVariables>, 'query'>) {
  return Urql.useQuery<GetMatchesQuery, GetMatchesQueryVariables>({ query: GetMatchesDocument, ...options });
};
export const GetMatchDocument = gql`
    query GetMatch($matchId: String!) {
  matchesByPk(id: $matchId) {
    id
    createdAt
    updatedAt
    status
    playerSente
    playerGote
    senteType
    goteType
    matchStates(orderBy: {index: ASC}) {
      createdAt
      matchId
      index
      usiMove
      sfen
      thinkingTime
    }
  }
}
    `;

export function useGetMatchQuery(options: Omit<Urql.UseQueryArgs<GetMatchQueryVariables>, 'query'>) {
  return Urql.useQuery<GetMatchQuery, GetMatchQueryVariables>({ query: GetMatchDocument, ...options });
};
export const GetChatMessagesDocument = gql`
    query GetChatMessages($matchId: String!) {
  chatMessages(where: {matchId: {_eq: $matchId}}, orderBy: {createdAt: ASC}) {
    id
    createdAt
    matchId
    role
    contents
    metadata
  }
}
    `;

export function useGetChatMessagesQuery(options: Omit<Urql.UseQueryArgs<GetChatMessagesQueryVariables>, 'query'>) {
  return Urql.useQuery<GetChatMessagesQuery, GetChatMessagesQueryVariables>({ query: GetChatMessagesDocument, ...options });
};
export const SubscribeChatMessagesDocument = gql`
    subscription SubscribeChatMessages($matchId: String!) {
  chatMessages(where: {matchId: {_eq: $matchId}}, orderBy: {createdAt: ASC}) {
    id
    createdAt
    matchId
    role
    contents
    metadata
    isPartial
  }
}
    `;

export function useSubscribeChatMessagesSubscription<TData = SubscribeChatMessagesSubscription>(options: Omit<Urql.UseSubscriptionArgs<SubscribeChatMessagesSubscriptionVariables>, 'query'>, handler?: Urql.SubscriptionHandler<SubscribeChatMessagesSubscription, TData>) {
  return Urql.useSubscription<SubscribeChatMessagesSubscription, TData, SubscribeChatMessagesSubscriptionVariables>({ query: SubscribeChatMessagesDocument, ...options }, handler);
};
export const SubscribeMatchStatesDocument = gql`
    subscription SubscribeMatchStates($matchId: String!) {
  matchStates(where: {matchId: {_eq: $matchId}}, orderBy: {index: ASC}) {
    createdAt
    matchId
    index
    usiMove
    sfen
    thinkingTime
    evaluation {
      id
      sfen
      engineName
      variations
      createdAt
      updatedAt
    }
  }
}
    `;

export function useSubscribeMatchStatesSubscription<TData = SubscribeMatchStatesSubscription>(options: Omit<Urql.UseSubscriptionArgs<SubscribeMatchStatesSubscriptionVariables>, 'query'>, handler?: Urql.SubscriptionHandler<SubscribeMatchStatesSubscription, TData>) {
  return Urql.useSubscription<SubscribeMatchStatesSubscription, TData, SubscribeMatchStatesSubscriptionVariables>({ query: SubscribeMatchStatesDocument, ...options }, handler);
};
export const StartMatchDocument = gql`
    mutation StartMatch($id: String, $playerSente: String, $playerGote: String, $senteType: PlayerType!, $goteType: PlayerType!) {
  startMatch(
    input: {id: $id, playerSente: $playerSente, playerGote: $playerGote, senteType: $senteType, goteType: $goteType}
  ) {
    id
    createdAt
    updatedAt
    status
    playerSente
    playerGote
    senteType
    goteType
  }
}
    `;

export function useStartMatchMutation() {
  return Urql.useMutation<StartMatchMutation, StartMatchMutationVariables>(StartMatchDocument);
};
export const SendChatMessageDocument = gql`
    mutation SendChatMessage($matchId: String!, $content: String!, $aiPersonality: AiPromptPersonality) {
  sendChatMessage(
    input: {matchId: $matchId, content: $content, aiPersonality: $aiPersonality}
  ) {
    success
  }
}
    `;

export function useSendChatMessageMutation() {
  return Urql.useMutation<SendChatMessageMutation, SendChatMessageMutationVariables>(SendChatMessageDocument);
};
export const EvaluateMatchStateDocument = gql`
    mutation EvaluateMatchState($input: EvaluateMatchStateInput!) {
  evaluateMatchState(input: $input) {
    type
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

export function useEvaluateMatchStateMutation() {
  return Urql.useMutation<EvaluateMatchStateMutation, EvaluateMatchStateMutationVariables>(EvaluateMatchStateDocument);
};