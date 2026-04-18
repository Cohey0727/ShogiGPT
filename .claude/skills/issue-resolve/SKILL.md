---
name: issue-resolve
description: GitHub Issueを解決する。コードを修正し、テストを通し、解決手法をissueコメントに記録してcloseする。IDがなければissue-listで選択させる。
---

# Issue Resolve

GitHub Issueを解決し、解決手法を記録する。

## 手順

### 1. Issue特定
- 引数にissue番号またはURLがあればそれを使う
- なければ `gh issue list --repo Cohey0727/ShogiGPTApp --state open` で一覧を表示し、ユーザーに選択させる

### 2. Issue内容と調査ログの確認
```bash
gh issue view <番号> --repo Cohey0727/ShogiGPTApp --comments
```

### 3. 修正
- 原因に基づいてコードを修正する
- テストを書く or 既存テストを修正する
- 全テストを実行して通ることを確認:
  ```bash
  cmake --build build && ./build/test_bitboard && ./build/test_position && ./build/test_usi && ./build/test_perft && ./build/test_dfpn && ./build/test_board_encoding && ./build/test_declare_win && ./build/test_move_encoding && ./build/test_normalization
  uv run pytest tests/ -q
  ```

### 4. 解決ログの記録
修正内容をissueコメントに書き込む:

```bash
gh issue comment <番号> --repo Cohey0727/ShogiGPTApp --body "$(cat <<'EOF'
## 解決 (YYYY-MM-DD)

### 原因
- 根本原因の説明

### 修正内容
- 変更したファイルと内容
- 修正のコミットハッシュ

### テスト
- 実行したテストと結果
- 再現確認

### 教訓
- 同じ問題を防ぐために何をすべきか
EOF
)"
```

### 5. コミット & Close
```bash
git add -A && git commit -m "fix: <修正内容> (closes #<番号>)"
git push
gh issue close <番号> --repo Cohey0727/ShogiGPTApp
```

## ルール
- 修正前に必ずテストで再現を確認する
- 修正後に全テストが通ることを確認する
- 解決手法は必ずissueコメントに記録する
- コミットメッセージに `closes #番号` を含めてissueを自動close
