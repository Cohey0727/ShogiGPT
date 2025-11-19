import { style } from "@vanilla-extract/css";

const styles = {
  container: style({
    height: "100%",
    width: "100%",
    overflow: "hidden",
    background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
  }),

  content: style({
    display: "flex",
    flexDirection: "row",
    height: "100%",
    width: "100%",
    "@media": {
      "(max-width: 1024px)": {
        flexDirection: "column",
      },
    },
  }),

  chatSection: style({
    display: "flex",
    flexDirection: "column",
    width: "400px",
    height: "100%",
    borderRight: "1px solid rgba(212, 175, 55, 0.15)",
    "@media": {
      "(max-width: 1024px)": {
        width: "100%",
        minWidth: "auto",
        borderRight: "none",
        borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
      },
    },
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
    height: "100%",
  }),
};

export default styles;
