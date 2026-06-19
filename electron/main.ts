// Electron メインプロセス（Node 実行層）。
// 責務は「ウィンドウのライフサイクル」と「OS 連携」のみ。アプリの状態・データは
// レンダラ（現プロトタイプ）の localStorage に置く（CLAUDE.md「当面ローカル継続」）。
// 責務境界と将来の拡張方針は docs/desktop.md を参照。
import { app, BrowserWindow, shell } from 'electron';
import path from 'node:path';

// 開発時に読み込む Vite dev サーバー。vite.config.ts の server.port と一致させる。
const DEV_SERVER_URL = 'http://localhost:5173';

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 720,
    minHeight: 560,
    backgroundColor: '#14161b', // tokens.css のダーク背景に合わせ、初期表示の白フラッシュを防ぐ
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      // セキュリティ既定：レンダラから Node へ直接触らせない。
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // 描画準備が整ってから表示（チラつき防止）
  win.once('ready-to-show', () => win.show());

  // 外部リンクはアプリ内ではなく OS の既定ブラウザで開く
  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  // 配布版はビルド済み dist を、開発時は Vite dev サーバーを読み込む
  if (app.isPackaged) {
    void win.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    void win.loadURL(DEV_SERVER_URL);
  }
}

void app.whenReady().then(() => {
  createWindow();

  // macOS：Dock アイコンからの再アクティブ化でウィンドウが無ければ作り直す
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// macOS 以外は全ウィンドウを閉じたらアプリ終了
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
