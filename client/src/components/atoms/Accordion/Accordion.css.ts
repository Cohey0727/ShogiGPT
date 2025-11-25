import { style, keyframes, globalStyle } from "@vanilla-extract/css";

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
      '&[data-state="closed"]:hover': {
        backgroundColor: "rgba(0, 0, 0, 0.2)",
      },
    },
  }),

  header: style({
    display: "flex",
    lineHeight: "1",
    selectors: {
      '[data-state="open"] &:hover': {
        backgroundColor: "rgba(0, 0, 0, 0.2)",
      },
      "&:focus": {
        outline: "none",
        boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.3)",
      },
    },
  }),

  trigger: style({
    all: "unset",
    fontFamily: "inherit",
    backgroundColor: "transparent",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.9375rem",
    cursor: "pointer",
    width: "100%",
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

  chevronContainer: style({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }),

  chevron: style({
    transition: "transform 300ms cubic-bezier(0.87, 0, 0.13, 1)",
    color: "#6b7280",
    marginTop: "4px",
    marginBottom: "4px",
    selectors: {
      '[data-state="open"] &': {
        transform: "rotate(180deg)",
      },
    },
  }),
};

globalStyle(`${styles.header} ${styles.trigger}`, {
  padding: "1rem",
});

export default styles;
