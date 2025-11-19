import { style, globalStyle, keyframes } from "@vanilla-extract/css";

const wave = keyframes({
  "0%, 60%, 100%": {
    transform: "translateY(0)",
    opacity: 0.6,
  },
  "30%": {
    transform: "translateY(-0.4rem)",
    opacity: 1,
  },
});

const styles = {
  messageOther: style({
    display: "flex",
    flexDirection: "column",
    alignSelf: "flex-start",
    maxWidth: "70%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "0.5rem",
    padding: "0.75rem 1rem",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  }),

  messageOwn: style({
    display: "flex",
    flexDirection: "column",
    alignSelf: "flex-end",
    maxWidth: "70%",
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderRadius: "0.5rem",
    padding: "0.75rem 1rem",
    border: "1px solid rgba(212, 175, 55, 0.3)",
  }),

  messageSender: style({
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "#d4af37",
    marginBottom: "0.25rem",
  }),

  messageContent: style({
    fontSize: "0.875rem",
    color: "#f5f5f5",
    lineHeight: 1.5,
    wordWrap: "break-word",
  }),

  messageTime: style({
    fontSize: "0.7rem",
    color: "#808080",
    textAlign: "right",
  }),

  loadingDots: style({
    display: "inline-flex",
    gap: "0.25rem",
    alignItems: "center",
  }),

  dot: style({
    width: "0.375rem",
    height: "0.375rem",
    borderRadius: "50%",
    backgroundColor: "#d4af37",
    animation: `${wave} 1.4s ease-in-out infinite`,
  }),

  dot1: style({
    animationDelay: "0s",
  }),

  dot2: style({
    animationDelay: "0.2s",
  }),

  dot3: style({
    animationDelay: "0.4s",
  }),
};

// Markdown要素のスタイリング
globalStyle(`${styles.messageContent} p`, {
  margin: "0.5rem 0",
});

globalStyle(`${styles.messageContent} p:first-child`, {
  marginTop: 0,
});

globalStyle(`${styles.messageContent} p:last-child`, {
  marginBottom: 0,
});

globalStyle(`${styles.messageContent} h1`, {
  fontSize: "1.5rem",
});

globalStyle(`${styles.messageContent} h2`, {
  fontSize: "1.25rem",
});

globalStyle(`${styles.messageContent} h3`, {
  fontSize: "1.1rem",
});

globalStyle(`${styles.messageContent} code`, {
  backgroundColor: "rgba(0, 0, 0, 0.3)",
  padding: "0.125rem 0.25rem",
  borderRadius: "0.25rem",
  fontSize: "0.85em",
  fontFamily: "monospace",
});

globalStyle(`${styles.messageContent} pre`, {
  backgroundColor: "rgba(0, 0, 0, 0.3)",
  padding: "0.75rem",
  borderRadius: "0.25rem",
  overflow: "auto",
  margin: "0.5rem 0",
});

globalStyle(`${styles.messageContent} pre code`, {
  backgroundColor: "transparent",
  padding: 0,
});

globalStyle(`${styles.messageContent} ul, ${styles.messageContent} ol`, {
  paddingInlineStart: "1.5rem",
  marginLeft: 0,
  marginTop: "0.5rem",
  marginBottom: "0.5rem",
});

globalStyle(`${styles.messageContent} li`, {
  marginTop: "0.25rem",
});

globalStyle(`${styles.messageContent} blockquote`, {
  borderLeft: "3px solid #d4af37",
  paddingLeft: "1rem",
  marginLeft: 0,
  color: "#cccccc",
});

globalStyle(`${styles.messageContent} a`, {
  color: "#d4af37",
  textDecoration: "underline",
});

globalStyle(`${styles.messageContent} a:hover`, {
  color: "#f0d060",
});

globalStyle(`${styles.messageContent} table`, {
  borderCollapse: "collapse",
  width: "100%",
  margin: "0.5rem 0",
});

globalStyle(`${styles.messageContent} th, ${styles.messageContent} td`, {
  border: "1px solid rgba(255, 255, 255, 0.2)",
  padding: "0.5rem",
  textAlign: "left",
});

globalStyle(`${styles.messageContent} th`, {
  backgroundColor: "rgba(212, 175, 55, 0.2)",
  fontWeight: "bold",
});

globalStyle(`${styles.messageContent} hr`, {
  border: "none",
  borderTop: "1px solid rgba(255, 255, 255, 0.2)",
  margin: "1rem 0",
});

export default styles;
