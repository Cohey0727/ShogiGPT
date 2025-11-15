import { style } from "@vanilla-extract/css";

const styles = {
  container: style({
    flex: 1,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    backgroundColor: "red",
  }),

  hero: style({
    textAlign: "center",
    maxWidth: "800px",
  }),

  title: style({
    fontSize: "4rem",
    fontWeight: "bold",
    color: "#f5f5f5",
    marginBottom: "1rem",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
    letterSpacing: "0.05em",
  }),

  kanji: style({
    fontSize: "5rem",
    fontWeight: "bold",
    background: "linear-gradient(45deg, #d4af37, #f4e5a1)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: "2rem",
  }),

  subtitle: style({
    fontSize: "1.25rem",
    color: "#b0b0b0",
    marginBottom: "3rem",
    lineHeight: "1.6",
  }),

  buttonContainer: style({
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "3rem",
  }),

  startButton: style({
    padding: "1rem 3rem",
    fontSize: "1.25rem",
    fontWeight: "bold",
    background: "linear-gradient(135deg, #d4af37 0%, #f4e5a1 100%)",
    color: "#1a1a1a",
    border: "none",
    borderRadius: "0.5rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px rgba(212, 175, 55, 0.4)",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 12px rgba(212, 175, 55, 0.6)",
    },
    ":active": {
      transform: "translateY(0)",
    },
  }),

  secondaryButton: style({
    padding: "1rem 2rem",
    fontSize: "1rem",
    fontWeight: "500",
    background: "transparent",
    color: "#d4af37",
    border: "2px solid #d4af37",
    borderRadius: "0.5rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    ":hover": {
      backgroundColor: "rgba(212, 175, 55, 0.1)",
      transform: "translateY(-2px)",
    },
  }),

  features: style({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "2rem",
    marginTop: "4rem",
    maxWidth: "1000px",
  }),

  feature: style({
    padding: "1.5rem",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "0.5rem",
    border: "1px solid rgba(212, 175, 55, 0.2)",
    transition: "all 0.3s ease",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      borderColor: "rgba(212, 175, 55, 0.4)",
      transform: "translateY(-4px)",
    },
  }),

  featureIcon: style({
    fontSize: "2.5rem",
    marginBottom: "1rem",
  }),

  featureTitle: style({
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#d4af37",
    marginBottom: "0.5rem",
  }),

  featureDescription: style({
    fontSize: "0.875rem",
    color: "#b0b0b0",
    lineHeight: "1.5",
  }),
};

export default styles;
