import { Link } from "wouter";
import { type ReactNode, useState } from "react";
import { HomeIcon, LayersIcon, GearIcon } from "@radix-ui/react-icons";
import { Header, Drawer } from "../../molecules";
import styles from "./RootLayout.css";

interface RootLayoutProps {
  children: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navigationItems = (
    <>
      <Link
        href="/"
        className={styles.logo}
        onClick={() => setIsDrawerOpen(false)}
      >
        <HomeIcon width={24} height={24} />
        <span className={styles.logoText}>ホーム</span>
      </Link>
      <nav className={styles.nav}>
        <Link
          href="/matches"
          className={styles.navLink}
          onClick={() => setIsDrawerOpen(false)}
        >
          <LayersIcon width={20} height={20} />
          <span className={styles.tooltip}>対局一覧</span>
        </Link>
        <Link
          href="/settings"
          className={styles.navLink}
          onClick={() => setIsDrawerOpen(false)}
        >
          <GearIcon width={20} height={20} />
          <span className={styles.tooltip}>設定</span>
        </Link>
      </nav>
    </>
  );

  return (
    <div className={styles.root}>
      <Header onMenuClick={() => setIsDrawerOpen(true)} />

      {/* Desktop Sidebar */}
      <aside className={styles.sidebar}>{navigationItems}</aside>

      {/* Mobile Drawer */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        {navigationItems}
      </Drawer>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
