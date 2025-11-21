import { style } from "@vanilla-extract/css";

const styles = {
  container: style({
    flex: 1,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    position: "relative",
  }),

  hero: style({
    textAlign: "center",
    maxWidth: "800px",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    position: "relative",
    zIndex: 1,
  }),

  title: style({
    fontSize: "7rem",
    fontWeight: "bold",
    backgroundClip: "text",
  }),

  subtitle: style({
    fontSize: "1.25rem",
    color: "#b0b0b0",
    lineHeight: "1.6",
  }),

  buttonContainer: style({
    flexWrap: "wrap",
  }),

  button: style({
    width: "150px",
  }),
};

export default styles;
