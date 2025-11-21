import { style, keyframes } from "@vanilla-extract/css";

const float = keyframes({
  "0%": {
    transform: "translateY(0) rotate(0deg)",
    opacity: 0.3,
  },
  "50%": {
    transform: "translateY(-100vh) rotate(180deg)",
    opacity: 0.6,
  },
  "100%": {
    transform: "translateY(-200vh) rotate(360deg)",
    opacity: 0.3,
  },
});

const styles = {
  container: style({
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: 0,
  }),

  pieceWrapper: style({
    position: "absolute",
    animation: `${float} linear infinite`,
    opacity: 0.4,
    filter: "blur(1px)",
  }),
};

export default styles;
