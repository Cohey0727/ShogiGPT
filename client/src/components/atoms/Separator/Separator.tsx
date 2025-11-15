import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { forwardRef } from "react";
import styles from "./Separator.css";

export const Separator = forwardRef<
  React.ComponentRef<typeof SeparatorPrimitive.Root>,
  SeparatorPrimitive.SeparatorProps
>(({ ...props }, ref) => (
  <SeparatorPrimitive.Root ref={ref} className={styles.root} {...props} />
));

Separator.displayName = "Separator";
