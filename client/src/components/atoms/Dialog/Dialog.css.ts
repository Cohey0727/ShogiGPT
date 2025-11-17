import { style, keyframes } from "@vanilla-extract/css";

const overlayShow = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const contentShow = keyframes({
  from: { opacity: 0, transform: "translate(-50%, -48%) scale(0.96)" },
  to: { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
});

const styles = {
  overlay: style({
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    position: "fixed",
    inset: 0,
    animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
    zIndex: 50,
  }),

  content: style({
    backgroundColor: "#2d2d2d",
    border: "1px solid rgba(212, 175, 55, 0.2)",
    borderRadius: "0.5rem",
    boxShadow:
      "0 10px 30px -3px rgba(0, 0, 0, 0.5), 0 4px 12px -2px rgba(0, 0, 0, 0.3)",
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90vw",
    maxWidth: "450px",
    maxHeight: "85vh",
    padding: "1.5rem",
    animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
    zIndex: 51,
    ":focus": {
      outline: "none",
    },
  }),

  title: style({
    fontSize: "1.125rem",
    fontWeight: "600",
    marginBottom: "1rem",
    color: "#f5f5f5",
  }),

  description: style({
    fontSize: "0.875rem",
    color: "#b0b0b0",
    marginBottom: "1rem",
  }),

  close: style({
    position: "absolute",
    top: "1rem",
    right: "1rem",
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
};

export default styles;
