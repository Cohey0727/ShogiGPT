import { style } from "@vanilla-extract/css";

const styles = {
  container: style({
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    alignItems: "center",
  }),

  board: style({
    display: "grid",
    gridTemplateColumns: "repeat(9, 1fr)",
    gridTemplateRows: "repeat(9, 1fr)",
    gap: "1px",
    backgroundColor: "#1a1a1a",
    padding: "1px",
    borderRadius: "0.5rem",
    aspectRatio: "1",
    maxWidth: "600px",
    width: "100%",
  }),

  cell: style({
    backgroundColor: "#d4a574",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: "1",
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#1a1a1a",
    cursor: "pointer",
    transition: "background-color 0.2s",
    ":hover": {
      backgroundColor: "#e6b584",
    },
  }),

  selected: style({
    backgroundColor: "#f0d090",
    boxShadow: "inset 0 0 0 3px #ff9800",
  }),

  piece: style({
    userSelect: "none",
    width: "80%",
    height: "80%",
    objectFit: "contain",
  }),

  gote: style({
    transform: "rotate(180deg)",
  }),

  info: style({
    display: "flex",
    gap: "2rem",
    width: "100%",
    maxWidth: "600px",
  }),

  captured: style({
    flex: 1,
    padding: "1rem",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(212, 175, 55, 0.2)",
    borderRadius: "0.5rem",
  }),

  capturedTitle: style({
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#d4af37",
    marginBottom: "0.5rem",
  }),

  capturedList: style({
    display: "flex",
    flexWrap: "wrap",
    gap: "0.25rem",
    minHeight: "2rem",
  }),

  capturedPiece: style({
    fontSize: "1rem",
    color: "#f5f5f5",
  }),

  turn: style({
    fontSize: "1rem",
    fontWeight: "600",
    color: "#f5f5f5",
    textAlign: "center",
  }),
};

export default styles;
