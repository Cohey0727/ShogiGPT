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

  boardSection: style({
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
