import { style, globalStyle } from "@vanilla-extract/css";

const styles = {
  overlay: style({
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
    animation: "fadeIn 0.2s ease-out",
    "@media": {
      "(min-width: 769px)": {
        display: "none",
      },
    },
  }),

  drawer: style({
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: "100vw",
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    zIndex: 1000,
    padding: "2rem 0",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    alignItems: "center",
    overflowY: "auto",
    transform: "translateX(-100%)",
    transition: "transform 0.3s ease-out",
    "@media": {
      "(min-width: 769px)": {
        display: "none",
      },
    },
  }),

  open: style({
    transform: "translateX(0)",
  }),

  closeButton: style({
    position: "absolute",
    top: "1rem",
    right: "1rem",
    background: "none",
    border: "none",
    color: "#d4af37",
    cursor: "pointer",
    padding: "0.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.2s ease",
    ":hover": {
      color: "#f4e5a1",
    },
    ":active": {
      color: "#c49f2f",
    },
  }),

  title: style({
    color: "#f5f5f5",
    fontSize: "1.5rem",
    fontWeight: "600",
    margin: "0 0 1rem 0",
    textAlign: "center",
  }),

  drawerNav: style({
    width: "100%",
  }),

  drawerNavLink: style({
    gap: "1rem",
    justifyContent: "flex-start",
    paddingLeft: "2rem",
  }),

  drawerNavText: style({
    position: "static",
    opacity: 1,
    marginLeft: 0,
    padding: 0,
    backgroundColor: "transparent",
    border: "none",
    fontSize: "1rem",
    pointerEvents: "auto",
  }),
};

// Make text visible in drawer
globalStyle(`${styles.drawer} a span`, {
  position: "static",
  opacity: 1,
  marginLeft: 0,
  padding: 0,
  backgroundColor: "transparent",
  border: "none",
  fontSize: "1rem",
  pointerEvents: "auto",
});

globalStyle(`${styles.drawer} nav`, {
  width: "100%",
});

globalStyle(`${styles.drawer} a`, {
  gap: "1rem",
  justifyContent: "flex-start",
  paddingLeft: "2rem",
  borderLeft: "none",
  borderBottom: "1px solid rgba(212, 175, 55, 0.1)",
});

// Show logo text in drawer
globalStyle(`${styles.drawer} a span`, {
  display: "block",
});

export default styles;
