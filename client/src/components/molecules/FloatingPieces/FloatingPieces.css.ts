import { style, keyframes } from "@vanilla-extract/css";

const float = keyframes({
  "0%": {
    transform: "translateY(0) rotate(0deg)",
    opacity: 0,
  },
  "10%": {
    opacity: 0.4,
  },
  "90%": {
    opacity: 0.4,
  },
  "100%": {
    transform: "translateY(-120vh) rotate(360deg)",
    opacity: 0,
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
    top: "100vh",
    animation: `${float} linear infinite`,
    filter: "blur(1px)",
  }),
};

export default styles;
