import { style } from "@vanilla-extract/css";

export const options = style({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  marginBottom: "16px",
});

export const optionButton = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "4px",
  padding: "16px",
  border: "1px solid rgba(212, 175, 55, 0.3)",
  borderRadius: "8px",
  backgroundColor: "rgba(45, 45, 45, 0.8)",
  cursor: "pointer",
  textAlign: "left",
  transition: "all 0.2s",
  ":hover": {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderColor: "rgba(212, 175, 55, 0.5)",
  },
  ":disabled": {
    opacity: 0.5,
    cursor: "not-allowed",
  },
});

export const optionButtonSelected = style({
  backgroundColor: "rgba(212, 175, 55, 0.15)",
  borderColor: "rgba(212, 175, 55, 0.7)",
  boxShadow: "0 0 0 1px rgba(212, 175, 55, 0.3)",
});

export const optionTitle = style({
  fontSize: "16px",
  fontWeight: 600,
  color: "#f5f5f5",
});

export const optionDescription = style({
  fontSize: "13px",
  color: "#b0b0b0",
  lineHeight: 1.4,
});
