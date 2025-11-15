import { Link } from "wouter";
import { type ReactNode } from "react";
import styles from "./RootLayout.css";

interface RootLayoutProps {
  children: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link href="/">
            <a className={styles.logo}>将棋</a>
          </Link>
          <div className={styles.navLinks}>
            <Link href="/matches">
              <a className={styles.navLink}>対局一覧</a>
            </Link>
            <Link href="/settings">
              <a className={styles.navLink}>設定</a>
            </Link>
          </div>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
