import { style } from "@vanilla-extract/css";

export default {
  container: style({
    background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
  }),

  message: style({
    marginBottom: "1.5rem",
  }),

  buttonContainer: style({
    display: "flex",
    gap: "0.75rem",
    justifyContent: "center",
    marginTop: "1rem",
    flexWrap: "wrap",
  }),
};
