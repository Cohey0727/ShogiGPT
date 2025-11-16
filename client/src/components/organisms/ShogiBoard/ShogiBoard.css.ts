import { style } from "@vanilla-extract/css";

const styles = {
  board: style({
    display: "grid",
    gridTemplateColumns: "repeat(9, 1fr)",
    gridTemplateRows: "repeat(9, 1fr)",
    gap: "1px",
    backgroundColor: "#1a1a1a",
    padding: "1px",
    borderRadius: "0.5rem",
    aspectRatio: "1",
    height: "100%",
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

  possibleMove: style({
    backgroundColor: "#a8d5a8",
    position: "relative",
    "::after": {
      content: "",
      position: "absolute",
      width: "30%",
      height: "30%",
      backgroundColor: "#4caf50",
      borderRadius: "50%",
      opacity: 0.7,
    },
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
};

export default styles;
