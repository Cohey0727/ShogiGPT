import { Link } from "wouter";
import { Button } from "../../atoms/Button";
import { SparklingText } from "../../molecules";
import styles from "./HomePage.css";

export function HomePage() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <SparklingText as="h2" className={styles.title}>
          ShogiGPT
        </SparklingText>
        <p className={styles.subtitle}>AIと一緒に将棋を楽しもう</p>
        <div className={styles.buttonContainer}>
          <Link href="/matches">
            <Button size="lg">対局を始める</Button>
          </Link>
          <Link href="/settings">
            <Button size="lg" variant="outlined">
              設定
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
