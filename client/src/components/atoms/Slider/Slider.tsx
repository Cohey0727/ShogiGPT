import * as SliderPrimitive from "@radix-ui/react-slider";
import { forwardRef } from "react";
import styles from "./Slider.css";

export const Slider = forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  SliderPrimitive.SliderProps
>(({ ...props }, ref) => (
  <SliderPrimitive.Root ref={ref} className={styles.root} {...props}>
    <SliderPrimitive.Track className={styles.track}>
      <SliderPrimitive.Range className={styles.range} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className={styles.thumb} />
  </SliderPrimitive.Root>
));

Slider.displayName = "Slider";
