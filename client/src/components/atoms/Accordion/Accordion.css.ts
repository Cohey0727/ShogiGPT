import { style, keyframes } from "@vanilla-extract/css";

const slideDown = keyframes({
  from: { height: 0 },
  to: { height: "var(--radix-accordion-content-height)" },
});

const slideUp = keyframes({
  from: { height: "var(--radix-accordion-content-height)" },
  to: { height: 0 },
});

const styles = {
  root: style({
    borderRadius: "0.375rem",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
  }),

  item: style({
    overflow: "hidden",
    selectors: {
      "&:first-child": {
        borderTopLeftRadius: "0.375rem",
        borderTopRightRadius: "0.375rem",
      },
      "&:last-child": {
        borderBottomLeftRadius: "0.375rem",
        borderBottomRightRadius: "0.375rem",
      },
      "&:focus-within": {
        position: "relative",
        zIndex: 1,
      },
    },
  }),

  header: style({
    display: "flex",
  }),

  trigger: style({
    all: "unset",
    fontFamily: "inherit",
    backgroundColor: "transparent",
    padding: "1rem",
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "0.9375rem",
    lineHeight: "1",
    cursor: "pointer",
    selectors: {
      "&:hover": {
        backgroundColor: "#f9fafb",
      },
      "&:focus": {
        outline: "none",
        boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.3)",
      },
    },
  }),

  content: style({
    overflow: "hidden",
    fontSize: "0.875rem",
    color: "#6b7280",
    selectors: {
      '&[data-state="open"]': {
        animation: `${slideDown} 300ms cubic-bezier(0.87, 0, 0.13, 1)`,
      },
      '&[data-state="closed"]': {
        animation: `${slideUp} 300ms cubic-bezier(0.87, 0, 0.13, 1)`,
      },
    },
  }),

  contentText: style({
    padding: "1rem",
  }),

  chevronContainer: style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }),

  chevron: style({
    transition: "transform 300ms cubic-bezier(0.87, 0, 0.13, 1)",
    color: "#6b7280",
    selectors: {
      '[data-state="open"] &': {
        transform: "rotate(180deg)",
      },
    },
  }),
};

export default styles;
