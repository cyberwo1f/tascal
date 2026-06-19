# CLAUDE.md — Tascal 開発ガイド

このリポジトリで作業する際の指針。**実装に着手する前に [`docs/`](./docs/) を読むこと**。
特に未決事項は [`docs/open-questions.md`](./docs/open-questions.md) を確認し、🔴 未決の前提に依存する実装は
勝手に進めず、決定を仰ぐ / 暫定方針を明示する。

## プロダクト概要

> **Tascal** — 一人経営・少人数チームのための「コミットメント（約束）を可視化し、AI と協働して守りきる」タスク管理ツール。

4 本柱：①一人〜少人数特化 ②マルチタスク ③コミットメントの可視化 ④AI エージェントとの能動的協働。
詳細は [`docs/vision.md`](./docs/vision.md)。

## 現在地

- **M0 = プロトタイプ実装が完了**：クライアント完結の ToDo SPA（`src/`、`localStorage` のみ）。
  これが Tascal の出発点。**段階拡張**で進める（Q-STRAT-1 決定、[`docs/roadmap.md`](./docs/roadmap.md)）。
- **次の主戦場 = M1（Electron 化）→ M4（コミットメント可視化）**。どちらもローカルで実装できる。
- **保留中**：マルチユーザー（M2）とホスト型 AI（M3）は「Web サービス展開」を判断してから。

### 確定した方針（2026-06-18）
- デスクトップ = **Electron**（Tauri 不採用）。モバイルは将来 **Swift / React+Capacitor** で別系統（Q-ARCH-1）。
- データ基盤 = **当面ローカル継続**。BaaS/自前API は Web 展開検討時に判断（Q-ARCH-2）。
- AI = **当面保留**。着手時は「提案のみ最小」から。**長期の北極星は「AI 社員のマネジメント」**
  （ミッションを与え自律実行、必要時にユーザーへエスカレーション Post）（Q-AI-1, [`docs/ai-collaboration.md`](./docs/ai-collaboration.md) §7）。
- ビジョン・機能は**継続調整中**。新アイデアは [`docs/product-spec.md`](./docs/product-spec.md) の「アイデア・バックログ」へ。

### 確定した方針（2026-06-19）
- **ミッション追加 = 「AI 格差をなくし、AI をより身近にする」**（[`docs/vision.md`](./docs/vision.md)）。一人ではやり切れない規模をあえて可視化し、AI でマルチタスクを可能にして「コミットメント最大化」へ導く。
- **Q-PROD-2 確定 = コミットメントは第一級エンティティ**（Commitment が複数 Task を束ねる）＋`status`化。owner/stakeholder/softDue は任意・**段階開示**で柱①（設定最小）と両立（[`docs/adr/0001-commitment-model.md`](./docs/adr/0001-commitment-model.md)）。
- **M4（コミット可視化）と AI 最小形（M3）は分離維持**。**AI 実装の前に人手で構造を検証する**（de-risk）。最終形は「リッチモデル＋AI 充填＋段階開示」。
- 今回の機能ブラッシュアップ／追加の全体像 → [`docs/proposals/2026-06-19-feature-brushup-proposal.md`](./docs/proposals/2026-06-19-feature-brushup-proposal.md)。

### ▶ 次セッションはここから
[`docs/open-questions.md`](./docs/open-questions.md) の「**次セッションの再開ポイント**」を参照。Q-PROD-2 は ✅ 決定済み（ADR-0001）。
残る主テーマ：①Q-PROD-3（遅延リスクの算出ルール／保存有無）と `Commitment`/`Task` スキーマの実装詰め ②Q-PROD-1（North Star）③「AI 社員」像の具体化（Q-AI-7〜9）。

## 確定している技術土台

| 項目 | 決定 |
| --- | --- |
| パッケージマネージャ | **pnpm**（`packageManager` で版固定、Corepack 運用） |
| ランタイム | **Node LTS**（`.nvmrc` 固定） |
| フロント | **Vite + React 18 + TypeScript（strict）** |
| 状態管理 | React Context（`src/store.tsx`）※スケール時は段階導入を検討（Q-ARCH-4） |
| スタイル | 素の CSS + CSS カスタムプロパティ（デザイントークン）。[`DESIGN.md`](./DESIGN.md) |
| 永続化（現状） | `localStorage`（キー `tascal.v1`）。当面ローカル継続 |
| デスクトップ | **Electron**（M1 で導入予定）。レンダラ=Web、メイン=Node（キー等の安全な実行層） |
| CI | GitHub Actions：`pnpm install --frozen-lockfile` → `pnpm build` |

データ基盤（BaaS/自前API）・モノレポ化のタイミングは Web 展開判断後（[`docs/architecture.md`](./docs/architecture.md)）。

## コマンド

```bash
corepack enable                # 初回のみ
pnpm install                   # 依存インストール
pnpm dev                       # 開発サーバー
pnpm build                     # 型チェック + 本番ビルド
pnpm typecheck                 # 型チェックのみ
```

## リポジトリ構成（現状）

```
.
├── CLAUDE.md            # このファイル
├── DESIGN.md            # デザインシステム
├── README.md           # 使い方
├── docs/               # 仕様・ロードマップ・未決事項（実装の拠り所）
├── src/                # 現プロトタイプ実装
│   ├── components/      # UI コンポーネント
│   ├── lib/            # 純粋ユーティリティ（date / priority / color / id / storage）
│   ├── data/seed.ts    # 初期サンプルデータ
│   ├── store.tsx       # 状態 + アクション + 永続化
│   ├── selectors.ts    # 表示用の派生データ計算
│   └── styles/         # tokens / base / app の CSS
└── .github/workflows/  # CI
```

## コーディング規約

- **日本語で書く**：コメント・ドキュメント・コミットメッセージ・PR は日本語（ユーザー方針）。
- **デザイントークンを使う**：色・余白・角丸は CSS 変数（`src/styles/tokens.css`）経由。
  個別コンポーネントに 16 進数や寸法を**直書きしない**。新色が要るならトークンとして追加し DESIGN.md を更新。
- **保存データと派生値を分離**：永続化する状態（store）と、そこから計算する表示値（selectors）を混ぜない。
- **締切は絶対日付**（`YYYY-MM-DD`）で保持し、表示時に当日との差分へ変換（`src/lib/date.ts`）。
  相対オフセットを保存しない（永続化で意味がずれるため）。
- **TypeScript strict** を維持。`any` を避ける。
- 既存のコードのスタイル（命名・粒度）に合わせる。プロトタイプ構成を一気に置き換えない（段階導入）。

## 意思決定の進め方

- 重要な論点は [`docs/open-questions.md`](./docs/open-questions.md) に **ID 付き**で記録し、状態を更新する。
- 影響の大きい決定は [`docs/adr/`](./docs/adr/) に ADR として残す（なぜそう決めたかを保全）。
- 仕様に未確定が残る箇所は `🔴 未決` / `🟡 提案` を明記し、**勝手に確定実装しない**。
- 進捗が出たら `docs/roadmap.md` のチェックボックス・状態表を更新する。

## セキュリティ / ポリシー（厳守）

組織ポリシー（managed settings）とユーザーのグローバル指針に従う。本プロジェクトで特に重要な点：

- **AI / 外部 API キーをレンダラ（Web フロント）・リポジトリに置かない**。
  デスクトップは Electron メインプロセス＋OS セキュアストレージで局所実行、Web 展開時はサーバープロキシ
  （[`docs/ai-collaboration.md`](./docs/ai-collaboration.md) §4.1、Q-AI-3）。
- 認証情報のハードコード禁止。環境変数の値を出力しない。
- 個人情報（氏名・メール・電話）をログに出力しない。
- DB への破壊的操作（DELETE/DROP/TRUNCATE）・本番操作は**承認フローを経る**。エージェントの自動実行から除外。

## やってはいけないこと

- 🔴 未決の前提に依存する機能を、決定を仰がずに本実装する。
- デザイントークンを無視した色・寸法の直書き。
- プロトタイプ構成の一括リライト（段階移行が原則）。
- ドキュメントとコードの乖離を放置する（決定したら docs に反映）。
