import * as AccordionPrimitive from "@radix-ui/react-accordion";
import styles from "./Accordion.css";
import clsx from "clsx";
import { useId } from "react";

interface AccordionProps extends Omit<AccordionPrimitive.AccordionSingleProps, "type"> {
  header: React.ReactNode;
}

export function Accordion({ header, children, className, ...rest }: AccordionProps) {
  const value = useId();
  return (
    <AccordionPrimitive.Root {...rest} type="single" className={clsx(styles.root, className)}>
      <AccordionItem value={value}>
        <AccordionPrimitive.Header className={styles.header}>
          <AccordionTrigger value={value}>{header}</AccordionTrigger>
        </AccordionPrimitive.Header>
        <AccordionContent>{children}</AccordionContent>
        <AccordionTrigger value={value}>
          <div className={styles.chevronContainer}>
            <ChevronIcon />
          </div>
        </AccordionTrigger>
      </AccordionItem>
    </AccordionPrimitive.Root>
  );
}

/**
 * シェブロンアイコンコンポーネント
 */
function ChevronIcon() {
  return (
    <svg
      className={styles.chevron}
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}

function AccordionItem(props: AccordionPrimitive.AccordionItemProps) {
  return <AccordionPrimitive.Item className={styles.item} {...props} />;
}

function AccordionTrigger(props: AccordionPrimitive.AccordionTriggerProps) {
  const { children, ...rest } = props;
  return (
    <AccordionPrimitive.Trigger className={styles.trigger} {...rest}>
      {children}
    </AccordionPrimitive.Trigger>
  );
}

function AccordionContent(props: AccordionPrimitive.AccordionContentProps) {
  const { children, ...rest } = props;
  return (
    <AccordionPrimitive.Content className={styles.content} {...rest}>
      {children}
    </AccordionPrimitive.Content>
  );
}
