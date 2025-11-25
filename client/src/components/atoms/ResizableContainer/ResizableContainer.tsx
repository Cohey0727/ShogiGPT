import { useState, useRef, useEffect, Fragment } from "react";
import type { ReactElement } from "react";
import { clsx } from "clsx";
import styles from "./ResizableContainer.css";

export interface ResizableContainerProps {
  /**
   * 分割する子要素の配列
   */
  children: ReactElement[];

  /**
   * 分割方向
   * @default "row"
   */
  direction?: "row" | "column";

  /**
   * 最初の要素の初期サイズ（px）
   * @default 400
   */
  defaultSize?: number;

  /**
   * 最小サイズ（px）
   * @default 200
   */
  minSize?: number;

  /**
   * 最大サイズ（px）
   * @default 800
   */
  maxSize?: number;

  /**
   * localStorageに保存するキー
   */
  storageKey?: string;
}

export function ResizableContainer({
  children,
  direction = "row",
  defaultSize = 400,
  minSize = 200,
  maxSize = Infinity,
  storageKey,
}: ResizableContainerProps) {
  const [size, setSize] = useState(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = Number.parseInt(saved, 10);
        if (!Number.isNaN(parsed)) {
          return Math.max(minSize, Math.min(maxSize, parsed));
        }
      }
    }
    return defaultSize;
  });

  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const newSize = direction === "row" ? e.clientX - rect.left : e.clientY - rect.top;

      const clampedSize = Math.max(minSize, Math.min(maxSize, newSize));
      setSize(clampedSize);

      if (storageKey) {
        localStorage.setItem(storageKey, String(clampedSize));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, direction, minSize, maxSize, storageKey]);

  const isRow = direction === "row";

  return (
    <div ref={containerRef} className={clsx(styles.container, isRow ? styles.row : styles.column)}>
      {children.map((child, index) => {
        const isFirst = index === 0;
        const isLast = index === children.length - 1;
        return (
          <Fragment key={index}>
            {isFirst ? (
              <div
                className={styles.panel}
                style={isRow ? { width: `${size}px` } : { height: `${size}px` }}
              >
                {child}
              </div>
            ) : (
              <div className={styles.panel}>{child}</div>
            )}
            {!isLast && (
              <div
                className={clsx(
                  styles.handle,
                  isRow ? styles.handleRow : styles.handleColumn,
                  isResizing && styles.handleActive,
                )}
                onMouseDown={handleMouseDown}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
