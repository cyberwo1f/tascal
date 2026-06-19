// レンダラ（Web）から参照できる Desktop API の型。
// 実体は electron/preload.ts の contextBridge.exposeInMainWorld('tascal', ...)。
// Electron 配下でのみ存在し、通常の Web ブラウザでは undefined になる。
// 当面は最小（環境判定とバージョン表示）。IPC を足したらこの型も更新する。
export {};

declare global {
  interface Window {
    tascal?: {
      readonly isDesktop: true;
      readonly platform: string;
      readonly versions: {
        readonly electron: string;
        readonly chrome: string;
        readonly node: string;
      };
    };
  }
}
