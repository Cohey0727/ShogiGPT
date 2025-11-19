import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

import styles from "./Col.css";

export interface ColProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 垂直方向の配置
   * @default "stretch"
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
}

export function Col({
  align = "stretch",
  justify = "start",
  gap = "none",
  className,
  ref,
  ...props
}: ColProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={clsx(
        styles.base,
        styles.align[align],
        styles.justify[justify],
        styles.gap[gap],
        className
      )}
      {...props}
    />
  );
}
