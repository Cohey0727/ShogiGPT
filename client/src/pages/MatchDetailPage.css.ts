import { style } from "@vanilla-extract/css";

const styles = {
  container: style({
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
    padding: "2rem",
  }),

  header: style({
    maxWidth: "1200px",
    margin: "0 auto 2rem",
  }),

  matchId: style({
    fontSize: "1rem",
    color: "#d4af37",
    fontWeight: "600",
    marginBottom: "0.5rem",
  }),

  title: style({
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#f5f5f5",
    marginBottom: "1rem",
  }),

  content: style({
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "2rem",
  }),

  boardSection: style({
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(212, 175, 55, 0.2)",
    borderRadius: "0.5rem",
    padding: "2rem",
  }),

  board: style({
    aspectRatio: "1",
    backgroundColor: "#d4a574",
    borderRadius: "0.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    color: "#1a1a1a",
    fontWeight: "bold",
    marginBottom: "1rem",
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

  infoSection: style({
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  }),

  infoCard: style({
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(212, 175, 55, 0.2)",
    borderRadius: "0.5rem",
    padding: "1.5rem",
  }),

  infoTitle: style({
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "#d4af37",
    marginBottom: "1rem",
  }),

  infoRow: style({
    display: "flex",
    justifyContent: "space-between",
    padding: "0.75rem 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    ":last-child": {
      borderBottom: "none",
    },
  }),

  infoLabel: style({
    color: "#b0b0b0",
    fontSize: "0.875rem",
  }),

  infoValue: style({
    color: "#f5f5f5",
    fontSize: "0.875rem",
    fontWeight: "500",
  }),

  moveList: style({
    maxHeight: "300px",
    overflowY: "auto",
    fontSize: "0.875rem",
  }),

  move: style({
    padding: "0.5rem",
    color: "#b0b0b0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
  }),

  backButton: style({
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    fontWeight: "500",
    background: "transparent",
    color: "#d4af37",
    border: "2px solid #d4af37",
    borderRadius: "0.5rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginBottom: "2rem",
    ":hover": {
      backgroundColor: "rgba(212, 175, 55, 0.1)",
    },
  }),
};

export default styles;
