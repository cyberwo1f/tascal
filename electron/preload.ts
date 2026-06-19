// プリロード：レンダラ（Web）へ「最小の安全な情報」だけを橋渡しする層。
// contextIsolation 有効・sandbox 有効の前提で、contextBridge 経由のみ公開する。
//
// 当面はデスクトップ判定とバージョン表示のみ。将来データ永続化や AI 実行を
// メインプロセスへ移す場合は、ここに ipcRenderer.invoke ベースの型付き API を足す
// （破壊的操作は承認フロー必須。詳細は docs/desktop.md）。
import { contextBridge } from 'electron';

// レンダラ側の型は src/desktop.d.ts（window.tascal）に手動で対応させている。
const api = {
  isDesktop: true as const,
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
};

contextBridge.exposeInMainWorld('tascal', api);
