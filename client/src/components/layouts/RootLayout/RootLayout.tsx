import { Link } from "wouter";
import { type ReactNode } from "react";
import { HomeIcon, LayersIcon, GearIcon } from "@radix-ui/react-icons";
import styles from "./RootLayout.css";

interface RootLayoutProps {
  children: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.logo}>
          <HomeIcon width={24} height={24} />
        </Link>
        <nav className={styles.nav}>
          <Link href="/matches" className={styles.navLink}>
            <LayersIcon width={20} height={20} />
            <span className={styles.tooltip}>対局一覧</span>
          </Link>
          <Link href="/settings" className={styles.navLink}>
            <GearIcon width={20} height={20} />
            <span className={styles.tooltip}>設定</span>
          </Link>
        </nav>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
