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

export const divider = style({
  color: "#999",
});

export const thinking = style({
  color: "#1976d2",
  fontWeight: 600,
});

export const time = style({
  color: "#666",
});

export const checkmate = style({
  color: "#d32f2f",
  fontWeight: 700,
  fontSize: "16px",
});
