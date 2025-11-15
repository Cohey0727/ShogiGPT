import { style } from "@vanilla-extract/css";

const styles = {
  root: style({
    position: "relative",
    display: "flex",
    alignItems: "center",
    userSelect: "none",
    touchAction: "none",
    width: "100%",
    height: "1.25rem",
  }),

  track: style({
    backgroundColor: "#e5e7eb",
    position: "relative",
    flexGrow: 1,
    borderRadius: "9999px",
    height: "0.5rem",
  }),

  range: style({
    position: "absolute",
    backgroundColor: "#3b82f6",
    borderRadius: "9999px",
    height: "100%",
  }),

  thumb: style({
    display: "block",
    width: "1.25rem",
    height: "1.25rem",
    backgroundColor: "white",
    border: "2px solid #3b82f6",
    borderRadius: "9999px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "#f9fafb",
    },
    ":focus": {
      outline: "none",
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)",
    },
  }),
};

export default styles;
