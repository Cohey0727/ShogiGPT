import { style } from "@vanilla-extract/css";

const styles = {
  root: style({
    all: "unset",
    backgroundColor: "white",
    width: "1.25rem",
    height: "1.25rem",
    borderRadius: "0.25rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #d1d5db",
    cursor: "pointer",
    transition: "all 0.2s",
    selectors: {
      "&:hover": {
        borderColor: "#9ca3af",
      },
      '&[data-state="checked"]': {
        backgroundColor: "#3b82f6",
        borderColor: "#3b82f6",
      },
      "&:focus": {
        outline: "none",
        boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.3)",
      },
    },
  }),

  indicator: style({
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
};

export default styles;
