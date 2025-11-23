import { style } from "@vanilla-extract/css";

export default {
  container: style({
    display: "flex",
    width: "100%",
    height: "100%",
  }),

  row: style({
    flexDirection: "row",
  }),

  column: style({
    flexDirection: "column",
  }),

  panel: style({
    overflow: "hidden",
    flexShrink: 0,
    ":last-child": {
      flex: 1,
      flexShrink: 1,
    },
  }),

  handle: style({
    flexShrink: 0,
    backgroundColor: "rgba(212, 175, 55, 0.5)",
    transition: "background-color 0.2s ease",
    cursor: "ew-resize",
    ":hover": {
      backgroundColor: "rgba(212, 175, 55, 0.8)",
    },
  }),

  handleRow: style({
    width: "1px",
    cursor: "ew-resize",
  }),

  handleColumn: style({
    height: "1px",
    cursor: "ns-resize",
  }),

  handleActive: style({
    backgroundColor: "rgba(212, 175, 55, 0.5)",
  }),
};
