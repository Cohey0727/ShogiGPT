import { style } from "@vanilla-extract/css";

const styles = {
  base: style({
    width: "100%",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "400",
    transition: "all 0.2s ease-in-out",
    border: "2px solid #333",
    outline: "none",
    backgroundColor: "#1a1a1a",
    color: "#fff",
    selectors: {
      "&:hover:not(:disabled)": {
        borderColor: "#FFA500",
      },
      "&:focus:not(:disabled)": {
        borderColor: "#FFD700",
        boxShadow: "0 0 0 3px rgba(255, 215, 0, 0.1)",
      },
      "&::placeholder": {
        color: "#666",
      },
    },
    ":disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
      backgroundColor: "#0f0f0f",
    },
  }),

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
