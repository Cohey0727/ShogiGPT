import { style } from "@vanilla-extract/css";

const styles = {
  base: style({
    display: "flex",
    flexDirection: "column",
    flex: "1 1 auto",
  }),

  align: {
    start: style({
      alignItems: "flex-start",
    }),
    center: style({
      alignItems: "center",
    }),
    end: style({
      alignItems: "flex-end",
    }),
    stretch: style({
      alignItems: "stretch",
    }),
  },

  justify: {
    start: style({
      justifyContent: "flex-start",
    }),
    center: style({
      justifyContent: "center",
    }),
    end: style({
      justifyContent: "flex-end",
    }),
    "space-between": style({
      justifyContent: "space-between",
    }),
    "space-around": style({
      justifyContent: "space-around",
    }),
  },

  gap: {
    none: style({
      gap: "0",
    }),
    xs: style({
      gap: "0.25rem",
    }),
    sm: style({
      gap: "0.5rem",
    }),
    md: style({
      gap: "1rem",
    }),
    lg: style({
      gap: "1.5rem",
    }),
    xl: style({
      gap: "2rem",
    }),
  },
};

export default styles;
