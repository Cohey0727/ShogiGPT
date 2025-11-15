import { Link } from "wouter";
import styles from "./HomePage.css";

export function HomePage() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.kanji}>将棋</h1>
        <h2 className={styles.title}>ShogiGPT</h2>
        <p className={styles.subtitle}>
          AIと一緒に将棋を楽しもう
        </p>

        <div className={styles.buttonContainer}>
          <Link href="/matches">
            <button className={styles.startButton}>対局を始める</button>
          </Link>
          <Link href="/settings">
            <button className={styles.secondaryButton}>設定</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
