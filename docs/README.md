# Tascal ドキュメント

Tascal を設計・実装するための資料一式です。これらは「あとで実装するための仕様」であり、
**確定事項と未決事項を区別**しながら更新していきます。未決事項は
[`open-questions.md`](./open-questions.md) で一元管理し、決まったものから各仕様へ反映します。

## 読む順番

1. [`vision.md`](./vision.md) — 何を・誰のために作るか（ビジョン / コンセプト / 非目標）
2. [`product-spec.md`](./product-spec.md) — 機能仕様・ユースケース・画面
3. [`data-model.md`](./data-model.md) — データモデル（エンティティと関係）
4. [`ai-collaboration.md`](./ai-collaboration.md) — AI エージェント協働の設計（中核の差別化）
5. [`architecture.md`](./architecture.md) — 技術アーキテクチャ（Web / デスクトップ / 将来モバイル）
6. [`roadmap.md`](./roadmap.md) — マイルストーン・目標・進捗追跡
7. [`open-questions.md`](./open-questions.md) — 未決事項・課題トラッカー（**実装前に要決定**）

## ステータスの凡例

仕様内の項目には次のマーカーを付けます。

| マーカー | 意味 |
| --- | --- |
| ✅ **確定** | 合意済み。実装してよい |
| 🟡 **提案** | こちらからの推奨。承認待ち（`open-questions.md` に対応 Q あり） |
| 🔴 **未決** | 方針未定。決めないと実装に進めない |
| 💤 **将来** | 今は対象外。後続マイルストーンで扱う |

## 現在地

- 動作する **プロトタイプ実装（クライアント完結の SPA）** が `src/` にあります（ローカル `localStorage` のみ）。
  これを Tascal の **M0 / 出発点**とみなし、ここから段階的に拡張します。
- 技術的な確定事項（pnpm / Node LTS / Vite + React + TS）は [`../CLAUDE.md`](../CLAUDE.md) を参照。

## 決定の記録（ADR）

アーキテクチャ上の重要な決定は [`adr/`](./adr/) に Architecture Decision Record として残します。
「なぜそう決めたか」を後から追えるようにするためです。
