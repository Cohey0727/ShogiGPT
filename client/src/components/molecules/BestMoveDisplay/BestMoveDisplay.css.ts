import { style } from "@vanilla-extract/css";

export default {
  container: style({
    marginTop: "12px",
  }),

  header: style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    paddingBottom: "8px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  }),

  title: style({
    margin: 0,
    fontSize: "16px",
    fontWeight: "bold",
    color: "#d4af37",
  }),

  meta: style({
    display: "flex",
    gap: "12px",
    fontSize: "12px",
    color: "#a0a0a0",
  }),

  engine: style({
    fontWeight: "500",
    color: "#d4af37",
  }),

  time: style({
    fontWeight: "500",
  }),

  bestMove: style({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 0",
    marginBottom: "12px",
  }),

  label: style({
    fontSize: "14px",
    fontWeight: "bold",
    color: "#d4af37",
  }),

  move: style({
    fontSize: "18px",
    fontWeight: "bold",
    color: "#f5f5f5",
  }),

  variations: style({
    marginTop: "12px",
  }),

  variationsTitle: style({
    margin: "0 0 8px 0",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#d4af37",
  }),

  variationsList: style({
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  }),

  variation: style({
    padding: "8px 0",
  }),

  variationHeader: style({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  }),

  rank: style({
    fontSize: "14px",
    fontWeight: "bold",
    color: "#d4af37",
  }),

  variationMove: style({
    fontSize: "14px",
    fontWeight: "600",
    color: "#f5f5f5",
  }),

  score: style({
    fontSize: "13px",
    fontWeight: "600",
    color: "#d4af37",
    padding: "2px 8px",
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    borderRadius: "4px",
    border: "1px solid rgba(212, 175, 55, 0.3)",
  }),

  depth: style({
    fontSize: "12px",
    color: "#a0a0a0",
  }),

  pv: style({
    display: "flex",
    gap: "4px",
    marginTop: "4px",
    fontSize: "12px",
    color: "#a0a0a0",
  }),

  pvLabel: style({
    fontWeight: "500",
    color: "#d4af37",
    writingMode: "vertical-rl",
  }),

  pvMoves: style({
    fontFamily: "monospace",
    color: "#c0c0c0",
  }),
};
