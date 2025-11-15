import { type ReactNode, useEffect } from "react";
import { Cross1Icon } from "@radix-ui/react-icons";
import styles from "./Drawer.css";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Drawer({ isOpen, onClose, children }: DrawerProps) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <aside className={`${styles.drawer} ${isOpen ? styles.open : ""}`}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="メニューを閉じる"
        >
          <Cross1Icon width={20} height={20} />
        </button>
        <h2 className={styles.title}>ShogiGPT</h2>
        {children}
      </aside>
    </>
  );
}
