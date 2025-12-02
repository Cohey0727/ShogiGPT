import { type SelectHTMLAttributes } from "react";

import clsx from "clsx";

import styles from "./Selector.css";

export interface SelectorOption<T extends string> {
  value: T;
  label: string;
}

export interface SelectorProps<T extends string> extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "onChange" | "value"
> {
  options: SelectorOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function Selector<T extends string>({
  options,
  value,
  onChange,
  className,
  ...selectProps
}: SelectorProps<T>) {
  return (
    <select
      className={clsx(styles.select, className)}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      {...selectProps}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
