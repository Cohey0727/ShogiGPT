import { Link } from "wouter";
import { Button } from "../../atoms/Button";
import styles from "./HomePage.css";

export function HomePage() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h2 className={styles.title}>ShogiGPT</h2>
        <p className={styles.subtitle}>AIと一緒に将棋を楽しもう</p>

        <div className={styles.buttonContainer}>
          <Link href="/matches">
            <Button>対局を始める</Button>
          </Link>
          <Link href="/settings">
            <Button variant="outlined">設定</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
