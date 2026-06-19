import { defineConfig, devices } from '@playwright/test';

// Web 版（Vite dev サーバー）に対する E2E スモーク。
// 初回のみブラウザの取得が必要： pnpm exec playwright install chromium
// Electron 本体の E2E は配布まわりを固める M5 以降で拡充する。
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
