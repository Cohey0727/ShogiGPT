import { style } from "@vanilla-extract/css";

export const container = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
  padding: "4px 12px",
  backgroundColor: "#f5f5f5",
  fontSize: "14px",
  fontWeight: 500,
  color: "#333",
  height: "28px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
});

export const thinking = style({
  color: "#1976d2",
  fontWeight: 600,
});

export const checkmate = style({
  color: "#d32f2f",
  fontWeight: 700,
  fontSize: "16px",
});

export const controls = style({
  display: "flex",
  alignItems: "center",
  gap: "8px",
});

export const button = style({
  border: "1px solid #ccc",
  backgroundColor: "#fff",
  cursor: "pointer",
  padding: "2px 8px",
  fontSize: "14px",
  borderRadius: "4px",
  transition: "all 0.2s",
  ":hover": {
    backgroundColor: "#f0f0f0",
  },
  ":active": {
    backgroundColor: "#e0e0e0",
  },
  ":disabled": {
    opacity: 0.4,
    cursor: "not-allowed",
    backgroundColor: "#f5f5f5",
  },
});

export const rightSection = style({
  display: "flex",
  alignItems: "center",
  gap: "8px",
});

export const iconButton = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #ccc",
  backgroundColor: "#fff",
  cursor: "pointer",
  padding: "4px",
  borderRadius: "4px",
  transition: "all 0.2s",
  ":hover": {
    backgroundColor: "#f0f0f0",
  },
  ":active": {
    backgroundColor: "#e0e0e0",
  },
});
