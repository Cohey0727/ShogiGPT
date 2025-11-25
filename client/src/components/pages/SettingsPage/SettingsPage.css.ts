import { style } from "@vanilla-extract/css";

const styles = {
  container: style({
    minWidth: "40%",
    padding: "2rem",
  }),

  header: style({}),

  title: style({
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#f5f5f5",
  }),

  subtitle: style({
    fontSize: "1rem",
    color: "#b0b0b0",
  }),

  content: style({}),

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
  }),

  settingRow: style({
    padding: "1rem 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    ":last-child": {
      borderBottom: "none",
    },
  }),

  settingLabel: style({}),

  settingName: style({
    fontSize: "1rem",
    fontWeight: "500",
    color: "#f5f5f5",
  }),

  settingDescription: style({
    fontSize: "0.875rem",
    color: "#b0b0b0",
  }),
};

export default styles;
