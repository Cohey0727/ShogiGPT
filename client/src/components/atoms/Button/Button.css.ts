import { style } from "@vanilla-extract/css";

const styles = {
  base: style({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    transition: "all 0.2s ease-in-out",
    cursor: "pointer",
    border: "none",
    outline: "none",
    boxShadow: "0 4px 8px rgba(255, 165, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2)",
    selectors: {
      "&:hover:not(:disabled)": {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 16px rgba(255, 165, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3)",
      },
      "&:active:not(:disabled)": {
        transform: "translateY(0)",
        boxShadow: "0 2px 4px rgba(255, 165, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)",
      },
    },
    ":disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  }),

  variant: {
    filled: style({
      background: "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)",
      color: "#1a1a1a",
      fontWeight: "600",
      textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
      selectors: {
        "&:hover:not(:disabled)": {
          background: "linear-gradient(135deg, #FFED4E 0%, #FFB700 50%, #FF9500 100%)",
        },
      },
    }),
    outlined: style({
      background: "transparent",
      border: "2px solid transparent",
      backgroundImage:
        "linear-gradient(#1a1a1a, #1a1a1a), linear-gradient(135deg, #FFD700, #FFA500, #FF8C00)",
      backgroundOrigin: "border-box",
      backgroundClip: "padding-box, border-box",
      color: "#FFD700",
    }),
    ghost: style({
      backgroundColor: "transparent",
      color: "#FFD700",
      selectors: {
        "&:hover:not(:disabled)": {
          backgroundColor: "rgba(255, 215, 0, 0.1)",
        },
      },
    }),
  },

  size: {
    sm: style({
      height: "2rem",
      padding: "0 0.75rem",
      fontSize: "0.75rem",
    }),
    md: style({
      height: "2.5rem",
      padding: "0 1rem",
      fontSize: "0.875rem",
    }),
    lg: style({
      height: "3rem",
      padding: "0 1.5rem",
      fontSize: "1.125rem",
    }),
  },
};

export default styles;
