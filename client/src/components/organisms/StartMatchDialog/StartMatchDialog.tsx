import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Button,
  Row,
  SegmentButton,
} from "../../atoms";
import styles from "./StartMatchDialog.css";

const options = [
  { value: "HUMAN" as const, label: "人間" },
  { value: "AI" as const, label: "AI" },
];

interface MatchConfig {
  senteType: "HUMAN" | "AI";
  goteType: "HUMAN" | "AI";
}

interface StartMatchDialogProps {
  open: boolean;
  onClose: () => void;
  value: MatchConfig;
  onChange: (value: MatchConfig) => void;
  onCreateMatch: () => void;
}

export function StartMatchDialog({
  open,
  onClose,
  value,
  onChange,
  onCreateMatch,
}: StartMatchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogTitle>新規対局を開始</DialogTitle>
        <DialogDescription>プレイヤーを選択してください</DialogDescription>

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>先手</label>
            <Row justify="center">
              <SegmentButton
                options={options}
                value={value.senteType}
                onChange={(senteType) => onChange({ ...value, senteType })}
              />
            </Row>
          </div>

          <div>
            <label className={styles.label}>後手</label>
            <Row justify="center">
              <SegmentButton
                options={options}
                value={value.goteType}
                onChange={(goteType) => onChange({ ...value, goteType })}
              />
            </Row>
          </div>
        </div>

        <Row gap="sm" justify="end">
          <Button variant="outlined" onClick={onClose}>
            キャンセル
          </Button>
          <Button variant="filled" onClick={onCreateMatch}>
            開始
          </Button>
        </Row>
      </DialogContent>
    </Dialog>
  );
}
