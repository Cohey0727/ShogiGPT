import { style } from "@vanilla-extract/css";

const styles = {
  captured: style({
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    padding: "1rem",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(212, 175, 55, 0.2)",
    borderRadius: "0.5rem",
    boxSizing: "border-box",
  }),

  capturedGote: style({
    gridColumn: "1 / 2",
    gridRow: "1 / 2",
    alignSelf: "start",
  }),

  capturedSente: style({
    gridColumn: "3 / 4",
    gridRow: "3 / 4",
    alignSelf: "end",
  }),

  capturedTitle: style({
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#d4af37",
    marginBottom: "0.5rem",
  }),

  capturedList: style({
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    minHeight: "2rem",
  }),

  capturedPieceItem: style({
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.25rem",
    backgroundColor: "rgba(212, 165, 116, 0.2)",
    borderRadius: "0.25rem",
    cursor: "pointer",
    transition: "background-color 0.2s",
    ":hover": {
      backgroundColor: "rgba(212, 165, 116, 0.4)",
    },
  }),

  capturedPieceImage: style({
    width: "2rem",
    height: "2rem",
    objectFit: "contain",
    userSelect: "none",
  }),

  capturedPieceCount: style({
    position: "absolute",
    bottom: "0",
    right: "0",
    fontSize: "0.625rem",
    fontWeight: "700",
    color: "#fff",
    backgroundColor: "#ff5722",
    borderRadius: "0.25rem",
    padding: "0.125rem 0.25rem",
    minWidth: "1rem",
    textAlign: "center",
  }),

  gote: style({
    transform: "rotate(180deg)",
  }),
};

export default styles;
