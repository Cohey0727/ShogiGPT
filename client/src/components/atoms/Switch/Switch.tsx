import * as SwitchPrimitive from "@radix-ui/react-switch";
import { forwardRef } from "react";
import styles from "./Switch.css";

export const Switch = forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  SwitchPrimitive.SwitchProps
>(({ ...props }, ref) => (
  <SwitchPrimitive.Root ref={ref} className={styles.root} {...props}>
    <SwitchPrimitive.Thumb className={styles.thumb} />
  </SwitchPrimitive.Root>
));

Switch.displayName = "Switch";
