import { useState } from "react";
import { useLocation } from "wouter";
import { createId } from "@paralleldrive/cuid2";
import { useStartMatchMutation } from "../../../generated/graphql/types";
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

export interface MatchConfig {
  senteType: "HUMAN" | "AI";
  goteType: "HUMAN" | "AI";
}

interface StartMatchDialogProps {
  open: boolean;
  onClose: () => void;
}

export function StartMatchDialog({ open, onClose }: StartMatchDialogProps) {
  const [, setLocation] = useLocation();
  const [{ fetching }, startMatch] = useStartMatchMutation();
  const [matchConfig, setMatchConfig] = useState<MatchConfig>({
    senteType: "HUMAN",
    goteType: "AI",
  });

  const handleStartMatch = async () => {
    try {
      const newMatchId = createId();
      const result = await startMatch({
        id: newMatchId,
        playerSente: matchConfig.senteType === "HUMAN" ? "あなた" : "ShogiGPT",
        playerGote: matchConfig.goteType === "HUMAN" ? "あなた" : "ShogiGPT",
        senteType: matchConfig.senteType,
        goteType: matchConfig.goteType,
      });

      if (result.data?.startMatch) {
        setLocation(`/matches/${result.data.startMatch.id}`);
        onClose();
      } else if (result.error) {
        alert(`対局の作成に失敗しました: ${result.error.message}`);
      }
    } catch (error) {
      alert(`対局の作成に失敗しました: ${error}`);
    }
  };

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
                value={matchConfig.senteType}
                onChange={(senteType) =>
                  setMatchConfig({ ...matchConfig, senteType })
                }
              />
            </Row>
          </div>

          <div>
            <label className={styles.label}>後手</label>
            <Row justify="center">
              <SegmentButton
                options={options}
                value={matchConfig.goteType}
                onChange={(goteType) =>
                  setMatchConfig({ ...matchConfig, goteType })
                }
              />
            </Row>
          </div>
        </div>

        <Row gap="sm" justify="end">
          <Button variant="outlined" onClick={onClose} disabled={fetching}>
            キャンセル
          </Button>
          <Button
            variant="filled"
            onClick={handleStartMatch}
            disabled={fetching}
          >
            {fetching ? "対局作成中..." : "対局開始"}
          </Button>
        </Row>
      </DialogContent>
    </Dialog>
  );
}
