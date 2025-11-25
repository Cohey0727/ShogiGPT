import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

import styles from "./Row.css";

export interface RowProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 垂直方向の配置
   * @default "start"
   */
  align?: "start" | "center" | "end" | "stretch";
  /**
   * 水平方向の配置
   * @default "start"
   */
  justify?: "start" | "center" | "end" | "space-between" | "space-around";
  /**
   * ギャップのサイズ
   * @default "md"
   */
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * 折り返しを許可するかどうか
   * @default false
   */
  wrap?: boolean;
}

export function Row({
  align = "start",
  justify = "start",
  gap = "none",
  wrap = false,
  className,
  ref,
  ...props
}: RowProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={clsx(
        styles.base,
        styles.align[align],
        styles.justify[justify],
        styles.gap[gap],
        wrap && styles.wrap,
        className,
      )}
      {...props}
    />
  );
}
