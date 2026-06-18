# Tascal

シンプルで気持ちのいい ToDo アプリ。
Claude Design で作成したプロトタイプ（`ToDoアプリ.dc.html`）を、React + Vite + TypeScript で
ピクセル忠実に実装したものです。

## 主な機能

- **スマートリスト**: 今日 / 今後の予定 / すべてのタスク / カレンダー
- **プロジェクト**: 色分けして管理。サイドバーから追加可能
- **タグ**: タスクに付与すると、サイドバーに自動で集約（未完件数の多い順）
- **優先度**: 高 / 中 / 低（並び順に反映）
- **締切**: 今日・明日・期限超過などを色とアイコンで表示
- **サブタスク**: 進捗バー付き。カード上でも詳細ドロワーでも編集可能
- **カレンダー表示**: 月グリッドで締切を俯瞰
- **詳細ドロワー**: タイトル・メモ・プロジェクト・優先度・締切・タグ・サブタスクを編集
- **ダーク / ライトテーマ**切り替え（設定は保存される）
- **達成リング**: 今日のタスクの完了率を可視化
- **完了時の祝祭アニメーション**
- **localStorage 永続化**: ブラウザを閉じてもデータが残る

## 技術スタック

- React 18 / TypeScript / Vite 5
- パッケージマネージャ: **pnpm**（`packageManager` フィールドで版を固定）
- ランタイム: Node LTS（`.nvmrc` で固定）
- 状態管理: React Context（`src/store.tsx`）
- スタイル: 素の CSS ＋ CSS カスタムプロパティ（デザイントークン）
- 永続化: `localStorage`（キー: `tascal.v1`）

## セットアップ

pnpm を使用します。Node に同梱の **Corepack** を有効化すると、`package.json` の
`packageManager` に固定したバージョンの pnpm が自動で使われます。

```bash
corepack enable            # 一度だけ（pnpm のバージョンを固定運用するため）
nvm use                    # .nvmrc の Node LTS に合わせる（任意）

pnpm install               # 依存関係のインストール
pnpm dev                   # 開発サーバー（http://localhost:5173）
pnpm build                 # 型チェック＋本番ビルド（dist/）
pnpm preview               # ビルド結果のプレビュー
pnpm typecheck             # 型チェックのみ
```

> CI では再現性のため `pnpm install --frozen-lockfile` を使います（`.github/workflows/ci.yml`）。
> 将来 API を追加する場合は `pnpm-workspace.yaml` を足してワークスペース化できます。

## ディレクトリ構成

```
src/
├── main.tsx              エントリ（StoreProvider でラップ）
├── App.tsx               全体レイアウト
├── types.ts              ドメイン型（Task / Project / Subtask …）
├── store.tsx             状態と全アクション、localStorage 永続化
├── selectors.ts          表示用の派生データ計算（ビュー絞り込み・件数・カレンダー等）
├── data/seed.ts          初期サンプルデータ
├── lib/
│   ├── date.ts           日付・締切表示ロジック
│   ├── priority.ts       優先度の色・ラベル
│   ├── color.ts          色ユーティリティ・パレット
│   ├── id.ts             一意 ID 生成
│   └── storage.ts        localStorage 読み書き
├── components/           UI コンポーネント群
└── styles/
    ├── tokens.css        デザイントークン（色・角丸・密度・テーマ）
    ├── base.css          リセット・スクロールバー・アニメーション
    └── app.css           各コンポーネントのスタイル
```

## 設計メモ：締切の持ち方

プロトタイプは締切を「今日からの相対日数」（今日=0、明日=1…）で保持していましたが、
永続化すると日付の意味がずれてしまうため、本実装では **絶対日付（`YYYY-MM-DD`）** で保存し、
表示時に当日との差分へ変換しています（`src/lib/date.ts`）。見た目（今日・明日・N日後…）は
プロトタイプと同一です。

## デザインシステム

色・タイポグラフィ・余白・コンポーネント規約は [`DESIGN.md`](./DESIGN.md) を参照してください。
