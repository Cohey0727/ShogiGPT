import { style } from "@vanilla-extract/css";

export default {
  container: style({
    marginTop: "12px",
  }),

  header: style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  }),

  title: style({
    margin: 0,
    fontSize: "16px",
    fontWeight: "bold",
    color: "#d4af37",
  }),

  turningPointsList: style({
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  }),

  turningPoint: style({
    padding: "12px",
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderRadius: "8px",
    border: "1px solid rgba(212, 175, 55, 0.2)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "rgba(212, 175, 55, 0.15)",
      borderColor: "rgba(212, 175, 55, 0.4)",
    },
  }),

  turningPointHeader: style({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  }),

  moveIndex: style({
    fontSize: "14px",
    fontWeight: "bold",
    color: "#d4af37",
    padding: "2px 8px",
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    borderRadius: "4px",
  }),

  comment: style({
    fontSize: "14px",
    color: "#e0e0e0",
    lineHeight: 1.5,
  }),

  bestMovesSection: style({
    marginTop: "8px",
    paddingTop: "8px",
    borderTop: "1px solid rgba(212, 175, 55, 0.15)",
  }),

  bestMovesLabel: style({
    fontSize: "12px",
    fontWeight: "bold",
    color: "#d4af37",
    marginBottom: "4px",
  }),

  bestMovesList: style({
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  }),

  bestMoveItem: style({
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "13px",
    color: "#c0c0c0",
  }),

  bestMoveArrow: style({
    color: "#666",
    fontSize: "12px",
  }),

  emptyMessage: style({
    padding: "16px",
    textAlign: "center",
    color: "#a0a0a0",
    fontSize: "14px",
  }),
};
