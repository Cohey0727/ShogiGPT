import { style } from "@vanilla-extract/css";

const styles = {
  root: style({
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
    display: "flex",
    flexDirection: "column",
  }),

  header: style({
    padding: "1rem 2rem",
    borderBottom: "1px solid rgba(212, 175, 55, 0.2)",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  }),

  nav: style({
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }),

  logo: style({
    fontSize: "1.5rem",
    fontWeight: "bold",
    background: "linear-gradient(45deg, #d4af37, #f4e5a1)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textDecoration: "none",
  }),

  navLinks: style({
    display: "flex",
    gap: "1.5rem",
    alignItems: "center",
  }),

  navLink: style({
    color: "#b0b0b0",
    textDecoration: "none",
    fontSize: "0.9375rem",
    fontWeight: "500",
    transition: "color 0.2s ease",
    ":hover": {
      color: "#d4af37",
    },
  }),

  main: style({
    flex: 1,
    display: "flex",
    flexDirection: "column",
  }),
};

export default styles;
