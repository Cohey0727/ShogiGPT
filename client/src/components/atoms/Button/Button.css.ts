import { style } from "@vanilla-extract/css";

const styles = {
  base: style({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    transition: "all 0.2s",
    cursor: "pointer",
    border: "none",
    outline: "none",
    ":disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  }),

  variant: {
    default: style({
      backgroundColor: "#d4af37",
      color: "#1a1a1a",
      selectors: {
        "&:hover:not(:disabled)": {
          backgroundColor: "#e5c158",
        },
      },
    }),
    outline: style({
      backgroundColor: "transparent",
      border: "1px solid rgba(212, 175, 55, 0.3)",
      color: "#b0b0b0",
      selectors: {
        "&:hover:not(:disabled)": {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          color: "#f5f5f5",
        },
      },
    }),
    ghost: style({
      backgroundColor: "transparent",
      color: "#b0b0b0",
      selectors: {
        "&:hover:not(:disabled)": {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
        },
      },
    }),
  },

  size: {
    sm: style({
      height: "2rem",
      padding: "0 0.75rem",
    }),
    md: style({
      height: "2.5rem",
      padding: "0 1rem",
    }),
    lg: style({
      height: "3rem",
      padding: "0 1.5rem",
    }),
  },
};

export default styles;
