import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Button } from "../../atoms/Button";
import styles from "./Header.css";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className={styles.header}>
      <Button variant="ghost" onClick={onMenuClick} aria-label="メニューを開く">
        <HamburgerMenuIcon width={24} height={24} />
      </Button>
      <h1 className={styles.title}>ShogiGPT</h1>
    </header>
  );
}
