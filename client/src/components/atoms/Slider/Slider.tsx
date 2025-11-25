import * as SliderPrimitive from "@radix-ui/react-slider";
import styles from "./Slider.css";

/**
 * スライダーコンポーネント
 */
export function Slider(props: SliderPrimitive.SliderProps) {
  return (
    <SliderPrimitive.Root className={styles.root} {...props}>
      <SliderPrimitive.Track className={styles.track}>
        <SliderPrimitive.Range className={styles.range} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className={styles.thumb} />
    </SliderPrimitive.Root>
  );
}
