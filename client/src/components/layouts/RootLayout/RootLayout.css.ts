import { style, globalStyle } from "@vanilla-extract/css";

const styles = {
  root: style({
    height: "100vh",
    overflow: "hidden",
    background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
    display: "flex",
    flexDirection: "column",
    "@media": {
      "(min-width: 769px)": {
        flexDirection: "row",
      },
    },
  }),

  sidebar: style({
    width: "80px",
    flex: "0 0 80px",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRight: "1px solid rgba(212, 175, 55, 0.2)",
    padding: "2rem 0",
    display: "none",
    flexDirection: "column",
    gap: "2rem",
    alignItems: "center",
    overflowY: "auto",
    "@media": {
      "(min-width: 769px)": {
        display: "flex",
      },
    },
  }),

  logo: style({
    color: "#d4af37",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.5rem",
    transition: "all 0.2s ease",
    ":hover": {
      color: "#f4e5a1",
    },
  }),

  logoText: style({
    display: "none",
    fontSize: "1rem",
    fontWeight: "500",
  }),

  nav: style({
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    width: "100%",
  }),

  navLink: style({
    color: "#b0b0b0",
    textDecoration: "none",
    fontSize: "0.9375rem",
    fontWeight: "500",
    padding: "1rem",
    transition: "all 0.2s ease",
    borderLeft: "3px solid transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    ":hover": {
      color: "#d4af37",
      backgroundColor: "rgba(212, 175, 55, 0.1)",
      borderLeftColor: "#d4af37",
    },
  }),

  tooltip: style({
    position: "absolute",
    left: "100%",
    marginLeft: "1rem",
    padding: "0.5rem 0.75rem",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    color: "#f5f5f5",
    fontSize: "0.875rem",
    borderRadius: "0.375rem",
    whiteSpace: "nowrap",
    opacity: 0,
    pointerEvents: "none",
    transition: "opacity 0.2s ease",
    border: "1px solid rgba(212, 175, 55, 0.3)",
  }),

  main: style({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflowX: "hidden",
    overflowY: "auto",
    "@media": {
      "(min-width: 769px)": {
        height: "100%",
      },
    },
  }),
};

globalStyle(`${styles.navLink}:hover span`, {
  opacity: 1,
});

export default styles;
