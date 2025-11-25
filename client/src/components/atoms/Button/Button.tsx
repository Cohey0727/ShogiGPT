import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./Button.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "outlined" | "ghost";
  size?: "sm" | "md" | "lg";
}

/**
 * ボタンコンポーネント
 */
export function Button({ variant = "filled", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(styles.base, styles.variant[variant], styles.size[size], className)}
      {...props}
    />
  );
}
