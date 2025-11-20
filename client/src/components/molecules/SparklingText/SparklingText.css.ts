import { style, keyframes } from "@vanilla-extract/css";

const gradientShift = keyframes({
  "0%": {
    backgroundPosition: "0% 50%",
  },
  "100%": {
    backgroundPosition: "200% 50%",
  },
});

const styles = {
  container: style({
    display: "inline-block",
    fontWeight: "700",
    background: `linear-gradient(90deg, var(--gradient-colors))`,
    backgroundSize: "200% 100%",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    animation: `${gradientShift} 3s linear infinite`,
    textShadow: "0 0 20px rgba(255, 215, 0, 0.5)",
    filter: "drop-shadow(0 0 10px rgba(255, 215, 0, 0.3))",
  }),
};

export default styles;
