import { Link } from "wouter";
import { Row, Button } from "../../atoms";
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
        <Row className={styles.buttonContainer} gap="md" justify="center">
          <Link href="/matches">
            <Button size="lg" className={styles.button}>
              対局を始める
            </Button>
          </Link>
          <Link href="/settings">
            <Button size="lg" variant="outlined" className={styles.button}>
              設定
            </Button>
          </Link>
        </Row>
      </div>
    </div>
  );
}
