import { style } from "@vanilla-extract/css";

const styles = {
  container: style({
    display: "inline-flex",
    border: "1px solid rgba(212, 175, 55, 0.3)",
    borderRadius: "0.375rem",
  }),

  button: style({
    flex: 1,
    minWidth: "4rem",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    border: "none",
    backgroundColor: "transparent",
    color: "#b0b0b0",
    transition: "all 0.2s",
    borderRight: "1px solid rgba(212, 175, 55, 0.3)",
    borderRadius: "0",
    ":first-child": {
      borderTopLeftRadius: "0.375rem",
      borderBottomLeftRadius: "0.375rem",
    },
    ":last-child": {
      borderRight: "none",
      borderTopRightRadius: "0.375rem",
      borderBottomRightRadius: "0.375rem",
    },

    ":disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  }),
  selected: style({
    backgroundColor: "#d4af37",
    color: "#1a1a1a",
    ":first-child": {
      borderTopLeftRadius: "0.375rem",
      borderBottomLeftRadius: "0.375rem",
    },
    ":last-child": {
      borderTopRightRadius: "0.375rem",
      borderBottomRightRadius: "0.375rem",
    },
  }),
};

export default styles;
