import { style } from "@vanilla-extract/css";

const styles = {
  container: style({
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
  }),

  content: style({
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    height: "100vh",
    width: "100vw",
    "@media": {
      "(max-width: 1024px)": {
        gridTemplateColumns: "1fr",
        gridTemplateRows: "1fr 1fr",
      },
    },
  }),

  chatSection: style({
    display: "flex",
    flexDirection: "column",
    height: "100%",
    borderRight: "1px solid rgba(212, 175, 55, 0.15)",
    "@media": {
      "(max-width: 1024px)": {
        borderRight: "none",
        borderBottom: "1px solid rgba(212, 175, 55, 0.15)",
      },
    },
  }),

  boardSection: style({
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    padding: "2rem",
    gap: "2rem",
  }),

  controls: style({
    display: "flex",
    gap: "0.5rem",
    justifyContent: "center",
  }),

  controlButton: style({
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    background: "rgba(212, 175, 55, 0.2)",
    color: "#d4af37",
    border: "1px solid #d4af37",
    borderRadius: "0.375rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "rgba(212, 175, 55, 0.3)",
    },
  }),
};

export default styles;
