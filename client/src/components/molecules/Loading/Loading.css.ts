import { style, keyframes } from "@vanilla-extract/css";

const spin = keyframes({
  "0%": { transform: "rotate(0deg)" },
  "100%": { transform: "rotate(360deg)" },
});

const styles = {
  container: style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "200px",
    gap: "16px",
  }),

  spinner: style({
    width: "48px",
    height: "48px",
    border: "4px solid rgba(0, 0, 0, 0.1)",
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: `${spin} 0.8s linear infinite`,
  }),

  text: style({
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: 500,
  }),
};

export default styles;
