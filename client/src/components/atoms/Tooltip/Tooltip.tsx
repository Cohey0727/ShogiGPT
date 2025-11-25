import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import styles from "./Tooltip.css";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = ({
  sideOffset = 4,
  ...props
}: TooltipPrimitive.TooltipContentProps) => (
  <TooltipPrimitive.Content sideOffset={sideOffset} className={styles.content} {...props}>
    {props.children}
    <TooltipPrimitive.Arrow className={styles.arrow} />
  </TooltipPrimitive.Content>
);
