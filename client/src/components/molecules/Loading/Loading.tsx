import styles from "./Loading.css";

interface LoadingProps {
  text?: string;
}

export function Loading({ text = "読み込み中..." }: LoadingProps) {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
}
