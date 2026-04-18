---
name: issue-list
description: GitHub Issuesの一覧を表示する。openなissueを優先度・ラベル付きで表示。
---

# Issue List

リポジトリのGitHub Issuesを一覧表示する。

## 手順

1. `gh issue list --repo Cohey0727/ShogiGPTApp --state open --limit 20` でopen issueを取得
2. 各issueのタイトル、番号、ラベル、assigneeを表示
3. closedも見たい場合は `--state all` で取得

## 表示フォーマット

```
#番号 [ラベル] タイトル (assignee)
```
