/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Tascal の開発・ビルド設定
export default defineConfig({
  // Electron は file:// 経由で dist を読み込むため、アセット参照を相対パスにする。
  // Web をルート配信する場合も相対パスで問題ない（本アプリはルーティングを持たない）。
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
  // ユニットテスト（Vitest）。純粋ロジック（lib / selectors）を中心に検証する。
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
