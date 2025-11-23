import { Link } from "wouter";
import { type ReactNode, useState, Suspense } from "react";
import { HomeIcon, LayersIcon, GearIcon } from "@radix-ui/react-icons";
import { Header, Drawer, Loading } from "../../molecules";
import styles from "./RootLayout.css";

interface RootLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  {
    href: "/",
    title: "ホーム",
    icon: <HomeIcon width={24} height={24} />,
  },
  {
    href: "/matches",
    title: "対局一覧",
    icon: <LayersIcon width={20} height={20} />,
  },
  {
    href: "/settings",
    title: "設定",
    icon: <GearIcon width={20} height={20} />,
  },
];

export function RootLayout({ children }: RootLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const renderNavigationItems = () => (
    <nav className={styles.nav}>
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={styles.navLink}
          onClick={() => setIsDrawerOpen(false)}
        >
          {item.icon}
          <span className={styles.tooltip}>{item.title}</span>
        </Link>
      ))}
    </nav>
  );

  return (
    <div className={styles.root}>
      <Header onMenuClick={() => setIsDrawerOpen(true)} />

      {/* Desktop Sidebar */}
      <aside className={styles.sidebar}>{renderNavigationItems()}</aside>

      {/* Mobile Drawer */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        {renderNavigationItems()}
      </Drawer>

      <main className={styles.main}>
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </main>
    </div>
  );
}
