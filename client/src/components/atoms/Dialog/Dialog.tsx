import * as DialogPrimitive from "@radix-ui/react-dialog";
import styles from "./Dialog.css";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = ({ ...props }: DialogPrimitive.DialogOverlayProps) => (
  <DialogPrimitive.Overlay className={styles.overlay} {...props} />
);

export const DialogContent = ({ children, ...props }: DialogPrimitive.DialogContentProps) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content className={styles.content} {...props}>
      {children}
      <DialogPrimitive.Close className={styles.close}>
        <span>×</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
);

export const DialogTitle = ({ ...props }: DialogPrimitive.DialogTitleProps) => (
  <DialogPrimitive.Title className={styles.title} {...props} />
);

export const DialogDescription = ({ ...props }: DialogPrimitive.DialogDescriptionProps) => (
  <DialogPrimitive.Description className={styles.description} {...props} />
);
