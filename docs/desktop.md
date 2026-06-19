# デスクトップ（Electron）構成と責務境界

M1 で導入した Electron シェルの構成・責務分担・IPC 方針をまとめる。
構成方針の決定経緯は [ADR-0002](./adr/0002-electron-in-place.md)（Q-ARCH-5）を参照。

## 1. 構成（現状維持＋ `electron/` 追加）

`src/`（プロトタイプ）はそのままレンダラとして使い、ルートに `electron/` を足すだけの最小構成。

```
tascal/
├── src/                  # レンダラ（現プロトタイプ。Web と共通）
├── electron/
│   ├── main.ts           # メインプロセス（ウィンドウのライフサイクル / OS 連携）
│   ├── preload.ts        # 安全な橋渡し（contextBridge のみ）
│   └── tsconfig.json     # メイン/プリロードの型チェック（CommonJS 前提）
├── electron-builder.yml  # 配布ビルド設定（M1 は最小：未署名 dir）
├── dist/                 # Vite ビルド成果物（レンダラ）
└── dist-electron/        # esbuild 成果物（main.cjs / preload.cjs）
```

- **メイン/プリロードのビルド**：esbuild で TypeScript を CommonJS（`.cjs`）へバンドルする
  （`package.json` は `"type": "module"` のため、CJS は明示的に `.cjs` 拡張子で出力する）。
- **レンダラのビルド**：従来どおり Vite。`base: './'` にして `file://` 経由でもアセットを相対解決できるようにしている。
- **読み込み先の切替**：`app.isPackaged` で判定。開発時は Vite dev サーバー（`http://localhost:5173`）、
  配布時はパッケージ内の `dist/index.html` を `loadFile` する。

## 2. 責務境界（レンダラ ⇄ メイン）

| 層 | 担当 | 現状 |
| --- | --- | --- |
| **レンダラ（Web / `src/`）** | UI・アプリ状態・**データ永続化（`localStorage`）** | プロトタイプそのまま。Web 版と完全共通 |
| **プリロード（`electron/preload.ts`）** | レンダラへ「最小の安全な情報」だけを公開 | デスクトップ判定とバージョン表示のみ |
| **メイン（`electron/main.ts`）** | ウィンドウ生成・ライフサイクル・OS 連携（外部リンクを既定ブラウザで開く 等） | 状態は持たない |

**原則**：アプリのデータと状態はレンダラに置く（Q-ARCH-2「当面ローカル継続」）。
メインプロセスは「ローカルの安全な実行層」として確保しておくが、M1 時点では権限のある処理を持たせない。

## 3. セキュリティ方針

- `contextIsolation: true` / `nodeIntegration: false` / `sandbox: true`（既定の堅牢設定）。
- レンダラへの公開は `contextBridge.exposeInMainWorld('tascal', ...)` 経由のみ。`window.tascal` の型は
  [`src/desktop.d.ts`](../src/desktop.d.ts) に対応させる（Web ブラウザでは `undefined`）。
- 外部リンクはアプリ内ナビゲーションを禁止し、OS の既定ブラウザで開く（`setWindowOpenHandler`）。
- **AI / 外部 API キーはレンダラ・リポジトリに置かない**（CLAUDE.md / 組織ポリシー）。
  将来 AI をローカル実行する場合は、キーをメインプロセス＋ OS セキュアストレージで局所管理する
  （[`ai-collaboration.md`](./ai-collaboration.md) §4.1、Q-AI-3）。

## 4. IPC 方針（将来の拡張）

M1 時点では権限のある IPC は無い（データは `localStorage`）。次の機能でメインプロセスの責務が要るときに足す：

- **追加方法**：`ipcMain.handle('<channel>', ...)`（メイン）＋ `ipcRenderer.invoke('<channel>', ...)` を
  `preload.ts` で `contextBridge` に包んで公開。レンダラからは `window.tascal.*` の型付き関数として呼ぶ。
- **対象になりうる処理**：ファイル/ローカル DB への永続化、OS 通知、AI のローカル実行（キー局所管理）。
- **破壊的操作は承認フロー必須**（組織ポリシー）。エージェントの自動実行から除外する。
- チャンネルは最小限・用途を限定し、任意コードを実行できる汎用 API は公開しない。

## 5. コマンド

```bash
pnpm dev               # Web のみ（ブラウザ開発）
pnpm dev:electron      # Vite dev サーバー＋ Electron を同時起動（デスクトップ開発）
pnpm build             # 型チェック（レンダラ＋electron）＋ Web 本番ビルド
pnpm build:electron    # メイン/プリロードを dist-electron/ へバンドル
pnpm dist:electron     # 配布ビルド（release/ に未署名アプリを生成）
pnpm test              # Vitest（純粋ロジックのユニットテスト）
pnpm test:e2e          # Playwright（初回のみ pnpm exec playwright install chromium）
```

## 6. 範囲外（後続マイルストーン）

- **署名・自動更新・各 OS インストーラ / 対象アーキテクチャの確定**：M5 以降（Q-ARCH-6）。
  M1 の `electron-builder.yml` は未署名の `dir` ターゲット（最小）に留める。
- **モノレポ化・共有コア（core/ui）の切り出し**：backend/server もしくは 2 つ目の UI 消費者の追加時まで後ろ倒し（ADR-0002）。
- **Electron 本体の E2E**：Playwright は当面 Web 版に対するスモークのみ。配布まわりと併せて M5 で拡充。
