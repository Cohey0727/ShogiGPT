import { formatMoveToJapanese, sfenToBoard, applyUsiMove } from "../shared/services";
import { analyzeMateTags, analyzeMoveTags } from "./analyzeMoveTags";
import type { MoveInfo } from "../shared/schemas/chatMessage";

export interface GenerateBestMovePromptParams {
  sfen: string;
  bestmove: string;
  variations: MoveInfo[];
  previousEvaluation?: number | null;
  currentEvaluation?: number | null;
}

/**
 * 将棋の局面解析結果からAIに渡すプロンプトを生成（API呼び出しなし）
 */
export function generateBestMovePrompt(params: GenerateBestMovePromptParams): string {
  const { sfen, bestmove, variations } = params;

  // 盤面情報を取得（駒名を表示するため）
  const board = sfenToBoard(sfen);

  // bestmoveも日本語に変換（駒名付き）
  const bestmoveJp = formatMoveToJapanese(bestmove, board);

  // bestmoveの読み筋から戦略を分析（盤面を1手ずつ更新しながら）
  const topVariation = variations[0];
  let strategyHint = "";

  if (topVariation?.pv && topVariation.pv.length > 0 && board) {
    try {
      let beforeBoard = board;
      const perspective = board.turn;
      const pvLines: string[] = [];

      // すべての読み筋を処理（indexが偶数=自分、奇数=相手）
      // 最大10手までに制限
      topVariation.pv.slice(0, 10).forEach((usiMove, index) => {
        const moveLabel = formatMoveToJapanese(usiMove, beforeBoard);
        const player = perspective === beforeBoard.turn ? "自分" : "相手";
        const afterBoard = applyUsiMove(beforeBoard, usiMove);
        // 各手の戦術特徴を分析
        const tacticalTags = analyzeMoveTags({
          beforeBoard,
          afterBoard,
          usiMove,
          perspective,
        });
        const mateTags = analyzeMateTags({
          beforeBoard,
          afterBoard,
          usiMove,
          perspective,
        });
        const allTags = [...mateTags, ...tacticalTags];

        // タグを含めて1手ごとに表示
        let moveDescription = `${index + 1}. ${player}: ${moveLabel}`;
        if (allTags.length > 0) {
          moveDescription += ` [${allTags.join("、")}]`;
        }

        beforeBoard = afterBoard;
        pvLines.push(moveDescription);
      });
      strategyHint = `${pvLines.join("\n")}`;
    } catch (error) {
      console.error("Failed to parse PV:", error);
      // エラー時は読み筋なしで続行
    }
  }

  const prompt = `# あなたは将棋の対局者です。今この局面で「${bestmoveJp}」を指します。

## 【読み筋の流れ】
${strategyHint}

## **厳守事項**:
- markdown形式で強弱をつけて出力してください。
- この考察はあなたの思考という前提です。ツールを使って得た情報ではありません。
- 必ず「です」「ます」を使うこと
- 読み筋はあくまで、あなたの考えた手順です。相手は必ずしもその通りに指すとは限りません。
- 読み筋の[]内のタグと、打ち手は正確に対応させること
- []のまま直接返事に含めないでください。文章に自然に組み込んでください。
- ()カッコ内は、元々いた駒の位置です。解説時は省いてください。
- 上記の読み筋とタグの連携を重視してください。
- 評価値の大きな変化がある場合は、その戦況変化を踏まえて解説してください
- 具体的な評価値の数値は一切言及しないこと
- **絶対厳守**: 詰みがある場合は必ず詰みを最優先に話題の中心にしてください。勝利、敗北の宣言を必ず行うこと。
- **絶対厳守**: 読み筋に含まれていない手を一切言及しないこと（想定される手、考えられる手なども一切言及禁止）
- **絶対厳守**: タグに含まれていない用語は絶対に使わないこと（例: 「角道を開ける」というタグがない場合は「角道を開ける」という言葉を使わない）
- 自分の手と相手の手を正確に区別すること
- 読み筋の展開を見据えて、この手の狙いを説明
- 相手の応手とそれに対する自分の対応を言及
- 主観的な表現（「〜と思います」「〜を狙います」「〜を取ります」）を使う
- 300文字以内で解説してください。`;

  return prompt;
}
