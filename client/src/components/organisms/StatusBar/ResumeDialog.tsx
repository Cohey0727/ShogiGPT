import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Button,
  Row,
  Col,
} from "../../atoms";
import * as styles from "./ResumeDialog.css";

export type ResumeAction = "rewind" | "fork";

interface ResumeDialogContentProps {
  onClose: () => void;
  onConfirm: (action: ResumeAction) => void;
  viewingIndex: number;
  isLoading?: boolean;
}

/**
 * ダイアログの内部コンテンツ
 * 親がopenをtrueにするたびにマウントされ、初期状態にリセットされる
 */
function ResumeDialogContent({
  onClose,
  onConfirm,
  viewingIndex,
  isLoading = false,
}: ResumeDialogContentProps) {
  const [selectedAction, setSelectedAction] = useState<ResumeAction>("rewind");

  const handleConfirm = () => {
    onConfirm(selectedAction);
  };

  return (
    <>
      <DialogTitle>再開方法を選択</DialogTitle>
      <DialogDescription>{viewingIndex}手目からの再開方法を選択してください。</DialogDescription>
      <Col className={styles.options}>
        <button
          className={`${styles.optionButton} ${selectedAction === "rewind" ? styles.optionButtonSelected : ""}`}
          onClick={() => setSelectedAction("rewind")}
          disabled={isLoading}
          type="button"
        >
          <div className={styles.optionTitle}>巻き戻す</div>
          <div className={styles.optionDescription}>
            現在の対局を{viewingIndex}手目まで巻き戻します。
            {viewingIndex}手目以降の指し手は削除されます。
          </div>
        </button>
        <button
          className={`${styles.optionButton} ${selectedAction === "fork" ? styles.optionButtonSelected : ""}`}
          onClick={() => setSelectedAction("fork")}
          disabled={isLoading}
          type="button"
        >
          <div className={styles.optionTitle}>新しい対局で再開</div>
          <div className={styles.optionDescription}>
            {viewingIndex}手目までの局面をコピーした新しい対局で再開します。
            元の対局はそのまま残ります。
          </div>
        </button>
      </Col>
      <Row gap="sm" justify="end">
        <Button variant="outlined" onClick={onClose} disabled={isLoading}>
          キャンセル
        </Button>
        <Button variant="filled" onClick={handleConfirm} disabled={isLoading}>
          {isLoading ? "処理中..." : "OK"}
        </Button>
      </Row>
    </>
  );
}

interface ResumeDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (action: ResumeAction) => void;
  viewingIndex: number;
  isLoading?: boolean;
}

/**
 * 再生ボタン押下時の選択ダイアログ
 * 巻き戻すか、新規対局を作成するかを選択する
 */
export function ResumeDialog({
  open,
  onClose,
  onConfirm,
  viewingIndex,
  isLoading = false,
}: ResumeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        {open && (
          <ResumeDialogContent
            onClose={onClose}
            onConfirm={onConfirm}
            viewingIndex={viewingIndex}
            isLoading={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
