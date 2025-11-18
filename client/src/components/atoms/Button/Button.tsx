import { forwardRef, type ButtonHTMLAttributes } from "react";
import styles from "./Button.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "outlined" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "filled", size = "md", className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${styles.base} ${styles.variant[variant]} ${styles.size[size]} ${className || ""}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
