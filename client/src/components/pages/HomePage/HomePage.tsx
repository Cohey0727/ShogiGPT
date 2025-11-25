import { Link } from "wouter";
import { Row, Button } from "../../atoms";
import { SparklingText, FloatingPieces } from "../../molecules";
import styles from "./HomePage.css";

export function HomePage() {
  return (
    <div className={styles.container}>
      <FloatingPieces />
      <div className={styles.hero}>
        <SparklingText as="h2" className={styles.title}>
          ShogiGPT
        </SparklingText>
        <p className={styles.subtitle}>※ ShogiGPTは間違った手を指すことがあります。</p>
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
