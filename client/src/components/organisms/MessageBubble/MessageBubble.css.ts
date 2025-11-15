import { style } from "@vanilla-extract/css";

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
    marginTop: "0.25rem",
    textAlign: "right",
  }),
};

export default styles;
