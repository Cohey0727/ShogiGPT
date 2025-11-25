import * as SeparatorPrimitive from "@radix-ui/react-separator";
import styles from "./Separator.css";

/**
 * セパレーターコンポーネント
 */
export function Separator(props: SeparatorPrimitive.SeparatorProps) {
  return <SeparatorPrimitive.Root className={styles.root} {...props} />;
}
