import {
  formatMoveToJapanese,
  sfenToBoard,
  applyUsiMove,
  analyzeMoveTags,
  analyzeMateTags,
} from "../shared/services";
import type { Board } from "../shared/consts/shogi";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

interface DeepSeekMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface MoveVariation {
  move: string;
  scoreCp: number | null | undefined;
  scoreMate: number | null | undefined;
  depth: number;
  nodes: number | null | undefined;
  pv: string[] | null | undefined;
}

export async function generateChatResponse(
  userMessage: string,
  conversationHistory: DeepSeekMessage[] = []
): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not set");
  }

  const messages: DeepSeekMessage[] = [
    {
      role: "system",
      content:
        "あなたは将棋の対局をサポートするAIアシスタントです。ユーザーの質問に対して、親切で分かりやすく回答してください。",
    },
    ...conversationHistory,
    {
      role: "user",
      content: userMessage,
    },
  ];

  const requestBody: DeepSeekRequest = {
    model: "deepseek-chat",
    messages,
    temperature: 0.7,
    max_tokens: 1000,
  };

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `DeepSeek API error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const data = (await response.json()) as DeepSeekResponse;

  const assistantMessage = data.choices[0]?.message?.content;
  if (!assistantMessage) {
    throw new Error("No response from DeepSeek API");
  }

  return assistantMessage;
}

/**
 * 将棋の局面解析結果から人間らしい解説Markdownを生成
 */
export async function generateBestMoveCommentary(params: {
  sfen: string;
  bestmove: string;
  variations: MoveVariation[];
  engineName: string;
  timeMs: number;
}): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not set");
  }

  const { sfen, bestmove, variations } = params;
  // engineName, timeMsは対局者視点では使用しない

  // 盤面情報を取得（駒名を表示するため）
  let board: Board | undefined;
  try {
    board = sfenToBoard(sfen);
  } catch (error) {
    console.error("Failed to parse SFEN:", error);
    // 盤面解析に失敗しても、駒名なしで続行
  }

  // bestmoveも日本語に変換（駒名付き）
  const bestmoveJp = formatMoveToJapanese(bestmove, board);

  // bestmoveの読み筋から戦略を分析（盤面を1手ずつ更新しながら）
  const topVariation = variations[0];
  let strategyHint = "";

  if (topVariation?.pv && topVariation.pv.length > 0 && board) {
    try {
      let currentBoard = board;
      const pvLines: string[] = [];

      // すべての読み筋を処理（indexが偶数=自分、奇数=相手）
      topVariation.pv.forEach((usiMove, index) => {
        const moveLabel = formatMoveToJapanese(usiMove, currentBoard);
        const player = index % 2 === 0 ? "自分" : "相手";
        const isSelfMove = index % 2 === 0; // 偶数=自分、奇数=相手

        // 各手の戦術特徴を分析
        const tacticalTags = analyzeMoveTags(currentBoard, usiMove, isSelfMove);
        const mateTags = analyzeMateTags(currentBoard, usiMove);
        const allTags = [...mateTags, ...tacticalTags];

        // タグを含めて1手ごとに表示
        let moveDescription = `${index + 1}. ${player}: ${moveLabel}`;
        if (allTags.length > 0) {
          moveDescription += ` [${allTags.join("、")}]`;
        }

        currentBoard = applyUsiMove(currentBoard, usiMove);
        pvLines.push(moveDescription);
      });
      strategyHint = `${pvLines.join("\n")}`;
    } catch (error) {
      console.error("Failed to parse PV:", error);
      // エラー時は読み筋なしで続行
    }
  }

  // 評価値から局面の状況を判断
  const topScore = variations[0]?.scoreCp ?? 0;

  // 評価値を100点満点に正規化（50点が互角、0点=後手めちゃくちゃ有利、100点=先手めちゃくちゃ有利）
  const normalizedScore = Math.min(
    100,
    Math.max(0, Math.round(topScore / 20) + 50)
  );

  let situation = "";
  if (normalizedScore >= 45 && normalizedScore <= 55) {
    situation = "互角の局面";
  } else if (normalizedScore > 55) {
    situation = normalizedScore > 75 ? "先手優勢" : "先手がやや有利";
  } else {
    situation = normalizedScore < 25 ? "後手優勢" : "後手がやや有利";
  }

  const prompt = `# あなたは将棋の対局者です。今この局面で次の一手を考えています。

## 現在の状況: ${situation}（評価値: ${normalizedScore}点/100点満点、50点=互角、100点=先手めちゃくちゃ有利、0点=後手めちゃくちゃ有利）

## 最善手は「${bestmoveJp}」です。

## 【読み筋の流れ】
${strategyHint}

## **厳守事項**:
- []内のタグを解説に活用して説明に組み込んでください。[]自体は表示しないでください。
- ()カッコ内は、元々いた駒の位置です。
- 上記の読み筋とタグの連携を重視してください。
- **絶対厳守**: 読み筋に含まれていない手を一切言及しないこと（想定される手、考えられる手なども一切言及禁止）
- **絶対厳守**: タグに含まれていない用語は絶対に使わないこと（例: 「角道を開ける」というタグがない場合は「角道を開ける」という言葉を使わない）
- 自分の手と相手の手を正確に区別すること
- 読み筋の展開を見据えて、この手の狙いを説明
- 相手の応手とそれに対する自分の対応を言及
- 主観的な表現（「〜と思います」「〜を狙います」「〜を取ります」）を使う
- 歩を進める場合は、「歩を突く」といいます、桂を進める場合は「桂を跳ねる」といいます
- 300文字以内、簡潔に`;

  const messages: DeepSeekMessage[] = [
    {
      role: "system",
      content:
        "あなたは将棋の対局者です。対局中に自分の考えを語る時は、一人称で主観的に話します。「〜と思います」「〜したいです」「〜が気になります」など、対局者の心情や判断を自然に表現してください。",
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  console.log("DeepSeek prompt:", prompt);

  const requestBody: DeepSeekRequest = {
    model: "deepseek-chat",
    messages,
    temperature: 0.0, // ランダム性を完全に排除し、決定論的な出力にする
    max_tokens: 400,
  };

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `DeepSeek API error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const data = (await response.json()) as DeepSeekResponse;

  const commentary = data.choices[0]?.message?.content;
  if (!commentary) {
    throw new Error("No commentary generated from DeepSeek API");
  }

  return commentary.trim();
}
