import { style } from "@vanilla-extract/css";

const styles = {
  container: style({
    height: "100%",
    width: "100%",
    overflow: "hidden",
    background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
  }),

  chatSection: style({
    display: "flex",
    flexDirection: "column",
    height: "100%",
  }),

  shogiTable: style({
    padding: "1rem",
  }),
};

export default styles;
