import { useGetMatchEvaluationsQuery } from "../../../generated/graphql/types";
import { Dialog, DialogContent, DialogTitle } from "../../atoms/Dialog";

interface EvaluationChartDialogProps {
  matchId: string;
  open: boolean;
  onClose: () => void;
}

/**
 * 評価値遷移を表示するダイアログ
 */
export function EvaluationChartDialog({ matchId, open, onClose }: EvaluationChartDialogProps) {
  // モーダルが開かれた時だけ評価値を取得
  const [{ data, fetching }] = useGetMatchEvaluationsQuery({
    variables: { matchId },
    pause: !open,
    requestPolicy: "network-only",
  });

  const evaluations = data?.matchEvaluations ?? [];

  const chartWidth = 400;
  const chartHeight = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;
  const maxScore = 2000;

  const points = evaluations.map((e, i) => {
    const x = padding.left + (i / Math.max(evaluations.length - 1, 1)) * innerWidth;
    const score = Math.max(-maxScore, Math.min(maxScore, e.scoreCp ?? 0));
    const y = padding.top + ((maxScore - score) / (2 * maxScore)) * innerHeight;
    return { x, y, score, moveIndex: e.moveIndex };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogTitle>評価値遷移</DialogTitle>
        <div style={{ padding: "16px 0" }}>
          {fetching ? (
            <p style={{ textAlign: "center", color: "#b0b0b0", padding: "32px" }}>読み込み中...</p>
          ) : evaluations.length === 0 ? (
            <p style={{ textAlign: "center", color: "#b0b0b0", padding: "32px" }}>
              評価値データがありません
            </p>
          ) : (
            <svg
              width={chartWidth}
              height={chartHeight}
              style={{ backgroundColor: "#1a1a1a", borderRadius: "4px" }}
            >
              {/* 0ライン */}
              <line
                x1={padding.left}
                y1={padding.top + innerHeight / 2}
                x2={chartWidth - padding.right}
                y2={padding.top + innerHeight / 2}
                stroke="#444"
                strokeDasharray="4"
              />
              {/* Y軸ラベル */}
              <text x={padding.left - 5} y={padding.top} fill="#666" fontSize={10} textAnchor="end">
                +{maxScore}
              </text>
              <text
                x={padding.left - 5}
                y={padding.top + innerHeight / 2}
                fill="#666"
                fontSize={10}
                textAnchor="end"
              >
                0
              </text>
              <text
                x={padding.left - 5}
                y={padding.top + innerHeight}
                fill="#666"
                fontSize={10}
                textAnchor="end"
              >
                -{maxScore}
              </text>
              {/* 線グラフ */}
              <path d={linePath} fill="none" stroke="#4CAF50" strokeWidth={2} />
              {/* ポイント */}
              {points.map((p) => (
                <circle
                  key={p.moveIndex}
                  cx={p.x}
                  cy={p.y}
                  r={3}
                  fill={p.score >= 0 ? "#2196F3" : "#F44336"}
                />
              ))}
              {/* X軸ラベル */}
              {points
                .filter(
                  (_, i) => i % Math.ceil(points.length / 10) === 0 || i === points.length - 1,
                )
                .map((p) => (
                  <text
                    key={p.moveIndex}
                    x={p.x}
                    y={chartHeight - 8}
                    fill="#666"
                    fontSize={10}
                    textAnchor="middle"
                  >
                    {p.moveIndex}
                  </text>
                ))}
            </svg>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
