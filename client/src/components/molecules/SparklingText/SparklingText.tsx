import { type ElementType, type HTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./SparklingText.css";

export interface SparklingTextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  children: string;
  colors?: string[];
}

const defaultColors = [
  "#FFD700", // Gold
  "#FFA500", // Orange
  "#FF8C00", // Dark Orange
  "#FFD700", // Gold
];

export const SparklingText = ({
  as: Component = "span",
  children,
  colors = defaultColors,
  className,
  style,
  ...props
}: SparklingTextProps) => {
  const gradientColors = colors.join(", ");

  return (
    <Component
      className={clsx(styles.container, className)}
      style={
        {
          ...style,
          "--gradient-colors": gradientColors,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </Component>
  );
};
