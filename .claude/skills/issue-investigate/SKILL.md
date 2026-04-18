---
name: issue-investigate
description: GitHub Issueを調査する。URLやIDを受け取り、コードを読み、テストを実行し、調査ログをissueコメントに書き込む。IDがなければissue-listで選択させる。
---

# Issue Investigate

GitHub Issueを調査し、調査ログをissueコメントに記録する。

## 手順

### 1. Issue特定
- 引数にissue番号またはURLがあればそれを使う
- なければ `gh issue list --repo Cohey0727/ShogiGPTApp --state open` で一覧を表示し、ユーザーに選択させる

### 2. Issue内容の確認
```bash
gh issue view <番号> --repo Cohey0727/ShogiGPTApp
gh issue view <番号> --repo Cohey0727/ShogiGPTApp --comments
```

### 3. 調査
- issueの症状を再現する
- 関連するソースコードを読む
- テストを実行して問題を特定する
- 原因の仮説を立てる

### 4. 調査ログの記録
調査結果をissueコメントに書き込む:

```bash
gh issue comment <番号> --repo Cohey0727/ShogiGPTApp --body "$(cat <<'EOF'
## 調査ログ (YYYY-MM-DD HH:MM)

### 再現
- 再現手順と結果

### 原因分析
- コードのどこが問題か
- 関連ファイル・行番号

### 仮説
- 原因の仮説

### 次のステップ
- 何をすべきか
EOF
)"
```

## ルール
- 調査したことは必ずissueコメントに記録する（他のLLMにも引き継げるように）
- 推測ではなく実際にコードを読み、テストを実行して確認する
- 1回の調査で解決しなくても、途中経過を記録する
