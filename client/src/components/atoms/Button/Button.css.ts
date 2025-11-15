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
      backgroundColor: "#3b82f6",
      color: "white",
      ":hover:not(:disabled)": {
        backgroundColor: "#2563eb",
      },
    }),
    outline: style({
      backgroundColor: "transparent",
      border: "1px solid #e5e7eb",
      color: "#374151",
      ":hover:not(:disabled)": {
        backgroundColor: "#f9fafb",
      },
    }),
    ghost: style({
      backgroundColor: "transparent",
      color: "#374151",
      ":hover:not(:disabled)": {
        backgroundColor: "#f9fafb",
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
