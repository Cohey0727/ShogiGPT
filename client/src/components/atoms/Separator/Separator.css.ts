import { style } from "@vanilla-extract/css";

const styles = {
  root: style({
    backgroundColor: "#e5e7eb",
    selectors: {
      '&[data-orientation="horizontal"]': {
        height: "1px",
        width: "100%",
      },
      '&[data-orientation="vertical"]': {
        height: "100%",
        width: "1px",
      },
    },
  }),
};

export default styles;
