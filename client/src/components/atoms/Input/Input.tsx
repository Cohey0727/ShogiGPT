import type { InputHTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./Input.css";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /**
   * 入力フィールドのサイズ
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
}

/**
 * 入力フィールドコンポーネント
 */
export function Input({ size = "md", className, ...props }: InputProps) {
  return (
    <input
      className={clsx(styles.base, styles.size[size], className)}
      {...props}
    />
  );
}
