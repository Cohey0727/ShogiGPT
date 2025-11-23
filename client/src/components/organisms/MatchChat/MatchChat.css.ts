import { style } from "@vanilla-extract/css";

const styles = {
  container: style({
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "transparent",
    overflow: "hidden",
  }),

  header: style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 1.5rem",
    borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
  }),

  title: style({
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#d4af37",
    margin: 0,
  }),

  matchId: style({
    display: "none",
  }),

  messagesContainer: style({
    flex: 1,
    overflowY: "auto",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    minHeight: 0,
  }),

  inputContainer: style({
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    padding: "1rem 1.5rem",
    borderTop: "1px solid rgba(212, 175, 55, 0.2)",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  }),

  textarea: style({
    width: "100%",
    padding: "0.75rem 1rem",
    fontSize: "0.875rem",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(212, 175, 55, 0.3)",
    borderRadius: "0.375rem",
    color: "#f5f5f5",
    outline: "none",
    transition: "border-color 0.2s ease, background-color 0.2s ease",
    resize: "none",
    overflow: "auto",
    fontFamily: "inherit",
    lineHeight: "1.5",
    boxSizing: "border-box",
    "::placeholder": {
      color: "#808080",
    },
    ":focus": {
      borderColor: "#d4af37",
      backgroundColor: "rgba(255, 255, 255, 0.08)",
    },
  }),

  sendButton: style({
    padding: "0.75rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    backgroundColor: "#d4af37",
    color: "#1a1a1a",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
    ":hover": {
      backgroundColor: "#c49d2f",
    },
    ":active": {
      transform: "scale(0.98)",
    },
  }),
};

export default styles;
