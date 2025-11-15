import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import styles from "./Header.css";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className={styles.header}>
      <button
        className={styles.hamburger}
        onClick={onMenuClick}
        aria-label="メニューを開く"
      >
        <HamburgerMenuIcon width={24} height={24} />
      </button>
      <h1 className={styles.title}>ShogiGPT</h1>
    </header>
  );
}
