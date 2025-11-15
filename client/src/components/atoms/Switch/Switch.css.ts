import { style } from "@vanilla-extract/css";

const styles = {
  root: style({
    all: "unset",
    width: "2.75rem",
    height: "1.5rem",
    backgroundColor: "#d1d5db",
    borderRadius: "9999px",
    position: "relative",
    cursor: "pointer",
    transition: "background-color 0.2s",
    selectors: {
      '&[data-state="checked"]': {
        backgroundColor: "#3b82f6",
      },
      "&:focus": {
        outline: "none",
        boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.3)",
      },
    },
  }),

  thumb: style({
    display: "block",
    width: "1.25rem",
    height: "1.25rem",
    backgroundColor: "white",
    borderRadius: "9999px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s",
    transform: "translateX(2px)",
    willChange: "transform",
    selectors: {
      '&[data-state="checked"]': {
        transform: "translateX(22px)",
      },
    },
  }),
};

export default styles;
