# ADR-0002: M1 の Electron 化は「現状維持＋ electron/ 追加」で行い、モノレポ化は後ろ倒しする

- **状態**: 承認
- **日付**: 2026-06-19
- **関連**: Q-ARCH-5（モノレポ化のタイミング）。Q-ARCH-1 ✅（Electron 採用）/ Q-ARCH-4（共有コア切り出し）と連動。

## 背景 / 課題
M1（基盤整備）の中心は「同一コードから Web とデスクトップ（Electron）を起動・ビルドできる」状態を作ること。
着手にあたり **2 つのドキュメントが正面衝突**していた：

- `CLAUDE.md`：「**プロトタイプ構成の一括リライト禁止／段階移行が原則**」（やってはいけないこと）。
- `architecture.md` §5：「**いきなり分割せず、バックエンド or デスクトップを足すタイミングで workspaces 化**」。

M1 は「デスクトップを足す瞬間」なので、後者を字義どおり読むと「今モノレポ化する」になり、前者と矛盾する。
リポジトリ構成は後から変えるコストが高い（ほぼ不可逆）ため、実装前に方針を確定する必要があった。

## 検討した選択肢
- **案A：現状維持＋ `electron/` 追加**（採用）。`src/` は再編せず、ルートに `electron/`（main + preload）を足す。
  dev は Vite dev サーバー、配布は `dist/` を `file://` で読み込む。
  - 長所：`CLAUDE.md` の段階移行原則に完全準拠。差分が小さく低リスク。M1 完了条件を最短で満たす。
  - 短所：将来モノレポ化する際に再編作業が一度発生する（が、その時点の方が必要な分割形が見えている）。
- **案B：軽量 workspaces 化**。`pnpm-workspace.yaml` ＋ `apps/web`（現 `src` 移設）＋ `apps/desktop`。core/ui は分けない。
  - 長所：`architecture.md` の暫定方針寄り。
  - 短所：`src` の移設という中規模リライトが発生し、段階移行原則と緊張。現時点で web は単一の消費者で、分割の便益が薄い。
- **案C：フルモノレポ**。`packages/core・ui・web・desktop` へ一気に再編。
  - 長所：`architecture.md` §5 の将来像に直行。
  - 短所：最大のリライト。`CLAUDE.md` の「一括リライト禁止」と正面衝突。core/ui の消費者が現状 1 つだけで、共有の便益が出ていない（YAGNI）。

## 決定
**案A を採用**（ユーザー確認のうえ決定、2026-06-19）。

- リポジトリは現状のフラット構成を維持し、ルートに `electron/`（`main.ts` / `preload.ts`）を追加する。
- ビルドは既存 Vite（レンダラ）＋ esbuild（メイン/プリロードを `.cjs` へバンドル）＋ electron-builder（配布）。
- **モノレポ化（Q-ARCH-5）と共有コア core/ui の切り出し（Q-ARCH-4）は、`server`（バックエンド/AI プロキシ）または
  2 つ目の消費者が実際に必要になる時点まで後ろ倒し**する。`architecture.md` §5 の将来像（`packages/*`）は維持しつつ、
  発火条件を「desktop 追加時」ではなく「**backend/server もしくは 2 つ目の UI 消費者の追加時**」に置き換える。

理由：動く土台が既にあり手戻りを避けたい（Q-STRAT-1 段階拡張）。モノレポの主便益（複数消費者での共有コア再利用）は
現フェーズに存在しない。`CLAUDE.md` の段階移行原則を最優先する。

## 影響
- **反映ドキュメント**：`architecture.md` §5（発火条件の言い換え）/ `open-questions.md`（Q-ARCH-5 を 🟡 / Q-ARCH-4 方針メモ）/
  `roadmap.md`（M1 チェック）/ `CLAUDE.md`（構成・コマンド）/ 新規 `docs/desktop.md`（責務境界・IPC 方針）。
- **新規コード**：`electron/main.ts`・`electron/preload.ts`・`electron/tsconfig.json`・`electron-builder.yml`・
  `src/desktop.d.ts`、`vite.config.ts`（`base: './'` ＋ Vitest 設定）、テスト（Vitest / Playwright 雛形）。
- **データ永続化**：当面レンダラの `localStorage` のまま（Q-ARCH-2「当面ローカル継続」）。
  ファイル/DB 永続化や AI 実行をメインプロセスへ移す場合は、preload に `ipcRenderer.invoke` ベースの型付き API を足す（`docs/desktop.md`）。
- **覆す場合のコスト**：将来モノレポへ移行する際、`src/` → `packages/web`、共有分を `core`/`ui` へ移す再編が必要。
  ただし発火時点では必要な分割境界が明確になっているため、見切り発車より低リスク。
