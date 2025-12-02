import { style, keyframes } from "@vanilla-extract/css";

const overlayShow = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const contentShow = keyframes({
  from: { opacity: 0, transform: "translate(-50%, -48%) scale(0.96)" },
  to: { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
});

export default {
  overlay: style({
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    position: "fixed",
    inset: 0,
    animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
    zIndex: 50,
  }),

  content: style({
    backgroundColor: "#2d2d2d",
    border: "1px solid rgba(212, 175, 55, 0.2)",
    borderRadius: "0.5rem",
    boxShadow: "0 10px 30px -3px rgba(0, 0, 0, 0.5), 0 4px 12px -2px rgba(0, 0, 0, 0.3)",
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "95vw",
    maxWidth: "800px",
    maxHeight: "92vh",
    padding: "1.5rem",
    animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
    zIndex: 51,
    overflow: "hidden",
    ":focus": {
      outline: "none",
    },
  }),

  inner: style({
    height: "100%",
  }),

  title: style({
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#d4af37",
    margin: 0,
  }),

  close: style({
    borderRadius: "0.25rem",
    height: "1.5rem",
    width: "1.5rem",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#b0b0b0",
    cursor: "pointer",
    border: "none",
    backgroundColor: "transparent",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      color: "#f5f5f5",
    },
    ":focus": {
      outline: "none",
      boxShadow: "0 0 0 2px rgba(212, 175, 55, 0.5)",
    },
  }),

  boardContainer: style({
    flex: 1,
    minHeight: 0,
  }),

  controlButton: style({
    padding: "8px 16px",
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    border: "1px solid rgba(212, 175, 55, 0.3)",
    borderRadius: "4px",
    color: "#d4af37",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "rgba(212, 175, 55, 0.2)",
      borderColor: "rgba(212, 175, 55, 0.5)",
    },
    ":disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  }),

  moveCounter: style({
    fontSize: "14px",
    color: "#a0a0a0",
    minWidth: "60px",
    textAlign: "center",
  }),

  commentSection: style({
    padding: "12px",
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderRadius: "8px",
    border: "1px solid rgba(212, 175, 55, 0.2)",
  }),

  commentLabel: style({
    fontSize: "12px",
    fontWeight: "bold",
    color: "#d4af37",
  }),

  commentText: style({
    fontSize: "14px",
    color: "#e0e0e0",
    lineHeight: 1.5,
  }),
};
