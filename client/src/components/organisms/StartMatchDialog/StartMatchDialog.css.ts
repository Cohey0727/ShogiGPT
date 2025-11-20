import { style } from "@vanilla-extract/css";

const styles = {
  form: style({
    marginTop: "1.5rem",
    marginBottom: "1rem",
  }),

  field: style({
    marginBottom: "1.5rem",
  }),

  label: style({
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: 500,
  }),
};

export default styles;
