import { style } from "@vanilla-extract/css";

const styles = {
  container: style({
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
    padding: "2rem",
  }),

  content: style({
    textAlign: "center",
    maxWidth: "500px",
  }),

  code: style({
    fontSize: "8rem",
    fontWeight: "bold",
    background: "linear-gradient(45deg, #d4af37, #f4e5a1)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    margin: 0,
    lineHeight: 1,
  }),

  title: style({
    fontSize: "2rem",
    fontWeight: "600",
    color: "#f5f5f5",
    marginTop: "1rem",
    marginBottom: "1rem",
  }),

  description: style({
    fontSize: "1rem",
    color: "#b0b0b0",
    marginBottom: "2rem",
    lineHeight: "1.6",
  }),

  homeButton: style({
    padding: "0.75rem 2rem",
    fontSize: "1rem",
    fontWeight: "600",
    background: "linear-gradient(135deg, #d4af37 0%, #f4e5a1 100%)",
    color: "#1a1a1a",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px rgba(212, 175, 55, 0.4)",
    textDecoration: "none",
    display: "inline-block",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 12px rgba(212, 175, 55, 0.6)",
    },
    ":active": {
      transform: "translateY(0)",
    },
  }),
};

export default styles;
