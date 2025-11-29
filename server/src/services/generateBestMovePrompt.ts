import { formatMoveToJapanese, sfenToBoard, applyUsiMove } from "../shared/services";
import { analyzeMateTags, analyzeMoveTags } from "./analyzeMoveTags";
import type { MoveInfo } from "../shared/schemas/chatMessage";

export interface GenerateBestMovePromptParams {
  /** 直前の盤面（ユーザーが指す前） */
  beforeSfen: string;
  /** 直前の評価・読み筋 */
  beforeVariations: MoveInfo[];
  /** 直後の盤面（ユーザーが指した後、AIが指す前） */
  afterSfen: string;
  /** 直後の評価・読み筋 */
  afterVariations: MoveInfo[];
  /** ユーザーの指し手（USI形式） */
  userMove: string;
}

/**
 * 評価値を戦況表現に変換する
 */
function formatEvaluationDescription(evalCp: number | null): string {
  if (evalCp === null) return "不明";
  const abs = Math.abs(evalCp);
  const side = evalCp >= 0 ? "先手" : "後手";
  if (abs < 100) return "互角";
  if (abs < 300) return `${side}やや有利`;
  if (abs < 500) return `${side}有利`;
  if (abs < 800) return `${side}優勢`;
  if (abs < 1500) return `${side}勝勢`;
  return `${side}必勝`;
}

/**
 * 評価値の変化を説明する（AI視点）
 */
function formatEvaluationChange(
  previous: number | null,
  current: number | null,
  aiPerspective: "SENTE" | "GOTE",
): string {
  if (previous === null || current === null) return "";

  // 評価値は常に先手視点。AI視点に変換
  // previousは「ユーザーが指す前」の評価（AIにとっては相手の手番）
  // currentは「ユーザーが指した後」の評価（AIにとっては自分の手番）
  // 手番が変わると評価値の符号も変わるため、比較時は反転
  const prevFromAi = aiPerspective === "SENTE" ? -previous : previous;
  const currFromAi = aiPerspective === "SENTE" ? current : -current;

  const diff = currFromAi - prevFromAi;

  if (Math.abs(diff) < 50) return "形勢に大きな変化なし";
  if (diff > 300) return "相手の失着で形勢が大きく好転";
  if (diff > 100) return "相手の失着で形勢がやや好転";
  if (diff < -300) return "相手の手で形勢が大きく悪化";
  if (diff < -100) return "相手の手で形勢がやや悪化";
  return "";
}

/**
 * 評価損失と候補順位から手の質を判定
 */
function evaluateMoveQuality(evalLoss: number, candidateRank: number | null): string {
  // 最善手の場合
  if (candidateRank === 1) {
    return "最善手";
  }

  // 評価損失に基づいて判定
  if (evalLoss <= 100) {
    return "好手";
  } else if (evalLoss <= 200) {
    return "次善手";
  } else if (evalLoss <= 300) {
    return "普通";
  } else if (evalLoss <= 500) {
    return "疑問手";
  } else if (evalLoss <= 1000) {
    return "悪手";
  } else {
    return "大悪手";
  }
}

/**
 * 将棋の局面解析結果からAIに渡すプロンプトを生成（API呼び出しなし）
 */
export function generateBestMovePrompt(params: GenerateBestMovePromptParams): string {
  const { beforeSfen, beforeVariations, afterSfen, afterVariations, userMove } = params;

  // 盤面情報を取得
  const beforeBoard = sfenToBoard(beforeSfen);
  const afterBoard = sfenToBoard(afterSfen);

  // ユーザーの指し手を日本語に変換（直前の盤面を使用）
  const userMoveJapanese = formatMoveToJapanese(userMove, beforeBoard);

  // AIの手番（直後の盤面の手番）
  const aiPerspective = afterBoard.turn;

  // 評価値を取得
  const beforeEval = beforeVariations[0]?.scoreCp ?? null;
  const afterEval = afterVariations[0]?.scoreCp ?? null;

  // ユーザーの手の候補順位を取得
  const userMoveRank = beforeVariations.findIndex((v) => v.move === userMove);
  const candidateRank = userMoveRank !== -1 ? userMoveRank + 1 : null;

  // 評価損失を計算（ユーザー視点）
  // beforeEvalはユーザーの手番での評価、afterEvalはAIの手番での評価
  // 手番が変わるので符号を反転して比較
  let evalLoss = 0;
  if (beforeEval !== null && afterEval !== null) {
    const bestScore = beforeVariations[0]?.scoreCp ?? 0;
    const userMoveVariation = beforeVariations.find((v) => v.move === userMove);
    if (userMoveVariation?.scoreCp !== null && userMoveVariation?.scoreCp !== undefined) {
      evalLoss = bestScore - userMoveVariation.scoreCp;
    } else {
      // 候補手にない場合: 手番が変わるので符号を反転して比較
      evalLoss = bestScore - -afterEval;
    }
  }

  // 手の質を判定
  const moveQuality = evaluateMoveQuality(evalLoss, candidateRank);

  // 評価値の説明を生成
  const currentEvalDesc = formatEvaluationDescription(afterEval);
  const evalChangeDesc = formatEvaluationChange(beforeEval, afterEval, aiPerspective);

  // ユーザーの手の評価説明を生成
  let userMoveDesc = `「${userMoveJapanese}」`;
  if (candidateRank === 1) {
    userMoveDesc += "（最善手）";
  } else if (candidateRank !== null && candidateRank <= 3) {
    userMoveDesc += `（候補${candidateRank}位、${moveQuality}）`;
  } else if (moveQuality) {
    userMoveDesc += `（${moveQuality}）`;
  }

  // AIのbestmoveを取得
  const bestmove = afterVariations[0]?.move ?? "";
  const bestmoveJp = formatMoveToJapanese(bestmove, afterBoard);

  // bestmoveの読み筋から戦略を分析（盤面を1手ずつ更新しながら）
  const topVariation = afterVariations[0];
  let strategyHint = "";

  // 読み筋の評価値情報
  let variationEvalInfo = "";
  if (topVariation) {
    if (topVariation.scoreMate !== null && topVariation.scoreMate !== undefined) {
      const mateIn = topVariation.scoreMate;
      if (mateIn > 0) {
        variationEvalInfo = `【${mateIn}手で詰み（自分の勝ち）】`;
      } else {
        variationEvalInfo = `【${Math.abs(mateIn)}手で詰まされる（自分の負け）】`;
      }
    } else if (topVariation.scoreCp !== null && topVariation.scoreCp !== undefined) {
      // 評価値を自分視点に変換
      const evalFromPerspective =
        aiPerspective === "SENTE" ? topVariation.scoreCp : -topVariation.scoreCp;
      variationEvalInfo = `【${formatEvaluationDescription(evalFromPerspective)}】`;
    }
  }

  if (topVariation?.pv && topVariation.pv.length > 0) {
    try {
      let currentBoard = afterBoard;
      const pvLines: string[] = [];

      // すべての読み筋を処理（indexが偶数=自分、奇数=相手）
      // 最大10手までに制限
      topVariation.pv.slice(0, 10).forEach((usiMove, index) => {
        const moveLabel = formatMoveToJapanese(usiMove, currentBoard);
        const player = aiPerspective === currentBoard.turn ? "自分" : "相手";
        const nextBoard = applyUsiMove(currentBoard, usiMove);
        // 各手の戦術特徴を分析
        const tacticalTags = analyzeMoveTags({
          beforeBoard: currentBoard,
          afterBoard: nextBoard,
          usiMove,
          perspective: aiPerspective,
        });
        const mateTags = analyzeMateTags({
          beforeBoard: currentBoard,
          afterBoard: nextBoard,
          usiMove,
          perspective: aiPerspective,
        });
        const allTags = [...mateTags, ...tacticalTags];

        // タグを含めて1手ごとに表示
        let moveDescription = `${index + 1}. ${player}: ${moveLabel}`;
        if (allTags.length > 0) {
          moveDescription += ` [${allTags.join("、")}]`;
        }

        currentBoard = nextBoard;
        pvLines.push(moveDescription);
      });
      strategyHint = `${pvLines.join("\n")}`;
    } catch (error) {
      console.error("Failed to parse PV:", error);
      // エラー時は読み筋なしで続行
    }
  }

  const prompt = `# あなたは将棋の対局者です。相手の手に対するリアクションと、自分の考えを説明してください。

## **相手の手**
相手は${userMoveDesc}と指してきました。
${evalChangeDesc ? `- ${evalChangeDesc}` : ""}

## **現在の形勢**
${currentEvalDesc}

## **この局面で指す手**
「${bestmoveJp}」を指します。
${variationEvalInfo}

## **予想する展開**
以下はあなたが頭の中で考えた手順です。相手は必ずしもその通りに指すとは限りません。
- []内のタグは、その手によって生じる特徴を表しています
- ()カッコ内は、元々いた駒の位置です。解説時は省いてください。
- 自分の手と相手の手を正確に区別すること
- 「読み筋」「読み」という単語は使わないこと。「〜と考えています」「〜を狙っています」「〜となれば」など自然な表現を使う
- **絶対厳守**: 詰みがある場合は必ず詰みを最優先に話題の中心にしてください。勝利、敗北の宣言を必ず行うこと。
- **絶対厳守**: []内に含まれていない手、用語は一切言及しないこと、「飛車先」「角道」などへの言及は、タグに基づかない限り使わないこと。

\`\`\`
${strategyHint}
\`\`\`

## **厳守事項**:
- markdown形式で強弱をつけて出力してください。タイトルは不要です。
- 必ず「です」「ます」を使うこと
- まず相手の手に対する感想を述べ、その後に自分の指し手とその狙いを説明する
- 相手の手が悪手や疑問手だった場合は、その点に触れる
- 具体的な評価値の数値は一切言及しないこと
- 主観的な表現（「〜と思います」「〜を狙います」）を使う
- 300文字以内で解説してください。`;

  return prompt;
}
