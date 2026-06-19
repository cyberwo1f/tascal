# Architecture Decision Records (ADR)

アーキテクチャ上の重要な決定を、**「なぜそう決めたか」が後から追える形**で残す場所。
`open-questions.md` で決着した重要論点のうち、影響範囲が大きいものを ADR 化する。

## 運用
- ファイル名：`NNNN-タイトル.md`（連番）。例：`0001-shell-strategy.md`
- 1 決定 = 1 ファイル。決定は原則**書き換えず**、覆る場合は新しい ADR で「supersedes」する。
- テンプレートは [`template.md`](./template.md)。

## 一覧
- [ADR-0001: コミットメントを第一級エンティティとして表現する](./0001-commitment-model.md)（2026-06-19・Q-PROD-2）
