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

  title: style({
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#f5f5f5",
    marginBottom: "0.5rem",
  }),

  subtitle: style({
    fontSize: "1rem",
    color: "#b0b0b0",
  }),

  matchList: style({
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gap: "1rem",
  }),

  matchCard: style({
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(212, 175, 55, 0.2)",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    transition: "all 0.3s ease",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      borderColor: "rgba(212, 175, 55, 0.4)",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    },
  }),

  matchHeader: style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  }),

  matchId: style({
    fontSize: "0.875rem",
    color: "#d4af37",
    fontWeight: "600",
  }),

  matchStatus: style({
    padding: "0.25rem 0.75rem",
    borderRadius: "0.25rem",
    fontSize: "0.75rem",
    fontWeight: "600",
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    color: "#22c55e",
  }),

  matchPlayers: style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  }),

  player: style({
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  }),

  playerName: style({
    fontSize: "1rem",
    fontWeight: "500",
    color: "#f5f5f5",
  }),

  vs: style({
    fontSize: "1rem",
    color: "#b0b0b0",
    fontWeight: "bold",
  }),

  matchInfo: style({
    display: "flex",
    gap: "1rem",
    fontSize: "0.875rem",
    color: "#b0b0b0",
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
