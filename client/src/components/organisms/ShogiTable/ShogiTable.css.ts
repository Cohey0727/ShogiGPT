import { style } from "@vanilla-extract/css";

const styles = {
  container: style({
    flex: 1,
    padding: "1rem",
    justifyContent: "center",
    alignItems: "center",
    gap: "1rem",
    height: "100%",
    overflow: "hidden",
  }),

  gotePieceStand: style({
    alignSelf: "flex-start",
  }),

  sentePieceStand: style({
    alignSelf: "flex-end",
  }),

  boardContainer: style({
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    alignItems: "center",
    aspectRatio: "1 / 1",
    maxWidth: "100%",
    maxHeight: "100%",
    overflow: "hidden",
  }),
};

export default styles;
