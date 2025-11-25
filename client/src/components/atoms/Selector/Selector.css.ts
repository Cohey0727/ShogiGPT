import { style } from "@vanilla-extract/css";

const styles = {
  select: style({
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(212, 175, 55, 0.3)",
    borderRadius: "0.375rem",
    color: "#f5f5f5",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      borderColor: "rgba(212, 175, 55, 0.5)",
    },
    ":focus": {
      outline: "none",
      borderColor: "#d4af37",
    },
    ":disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  }),
};

export default styles;
