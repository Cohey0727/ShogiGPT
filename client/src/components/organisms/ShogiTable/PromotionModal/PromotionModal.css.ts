import { style } from "@vanilla-extract/css";

export const overlay = style({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.75)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  backdropFilter: "blur(4px)",
});

export const modal = style({
  background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
  padding: "32px",
  borderRadius: "12px",
  border: "2px solid rgba(212, 165, 116, 0.3)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  minWidth: "280px",
});

export const title = style({
  fontSize: "22px",
  fontWeight: "bold",
  textAlign: "center",
  color: "#d4a574",
  marginBottom: "4px",
  letterSpacing: "0.05em",
});

export const options = style({
  display: "flex",
  gap: "20px",
  justifyContent: "center",
});

export const option = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
  padding: "16px",
  backgroundColor: "#d4a574",
  border: "3px solid rgba(212, 165, 116, 0.5)",
  borderRadius: "12px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  ":hover": {
    borderColor: "#ff9800",
    backgroundColor: "#e6b584",
    transform: "translateY(-4px)",
    boxShadow: "0 6px 20px rgba(255, 152, 0, 0.3)",
  },
  ":active": {
    transform: "translateY(-2px)",
  },
});

export const pieceImage = style({
  width: "100px",
  height: "100px",
  objectFit: "contain",
  filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
});

export const pieceLabel = style({
  fontSize: "16px",
  fontWeight: "bold",
  color: "#1a1a1a",
  letterSpacing: "0.05em",
});
