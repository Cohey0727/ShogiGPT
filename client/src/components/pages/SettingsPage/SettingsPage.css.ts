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

  content: style({
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gap: "1.5rem",
  }),

  section: style({
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(212, 175, 55, 0.2)",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    transition: "all 0.3s ease",
  }),

  sectionTitle: style({
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#d4af37",
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  }),

  settingRow: style({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    ":last-child": {
      borderBottom: "none",
    },
  }),

  settingLabel: style({
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  }),

  settingName: style({
    fontSize: "1rem",
    fontWeight: "500",
    color: "#f5f5f5",
  }),

  settingDescription: style({
    fontSize: "0.875rem",
    color: "#b0b0b0",
  }),

  select: style({
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(212, 175, 55, 0.3)",
    borderRadius: "0.375rem",
    color: "#f5f5f5",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      borderColor: "rgba(212, 175, 55, 0.5)",
    },
    ":focus": {
      outline: "none",
      borderColor: "#d4af37",
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

  saveButton: style({
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
    marginTop: "1rem",
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
