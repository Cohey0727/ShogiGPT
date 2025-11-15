import { style } from "@vanilla-extract/css";

const styles = {
  header: style({
    display: "none",
    height: "60px",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
    padding: "0 1rem",
    alignItems: "center",
    gap: "1rem",
    "@media": {
      "(max-width: 768px)": {
        display: "flex",
      },
    },
  }),

  hamburger: style({
    background: "none",
    border: "none",
    color: "#d4af37",
    cursor: "pointer",
    padding: "0.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.2s ease",
    ":hover": {
      color: "#f4e5a1",
    },
    ":active": {
      color: "#c49f2f",
    },
  }),

  title: style({
    color: "#f5f5f5",
    fontSize: "1.25rem",
    fontWeight: "600",
    margin: 0,
  }),
};

export default styles;
