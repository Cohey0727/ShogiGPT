import { type ButtonHTMLAttributes } from "react";
import styles from "./SegmentButton.css";
import clsx from "clsx";

export interface SegmentButtonOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentButtonProps<T extends string> extends Omit<
  ButtonHTMLAttributes<HTMLDivElement>,
  "onChange" | "value"
> {
  options: SegmentButtonOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentButton<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
  ...divProps
}: SegmentButtonProps<T>) {
  const { className, ...rest } = divProps;
  return (
    <div className={clsx(styles.container, className)} {...rest}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`${styles.button} ${value === option.value ? styles.selected : ""}`}
          onClick={() => onChange(option.value)}
          disabled={disabled}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
