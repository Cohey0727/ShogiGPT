import { forwardRef, type InputHTMLAttributes } from "react";
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

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size = "md", className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(styles.base, styles.size[size], className)}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
