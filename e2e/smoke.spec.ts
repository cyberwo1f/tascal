import { test, expect } from '@playwright/test';

// 最小スモーク：アプリが起動してタイトルと見出しが表示される
test('アプリが起動して表示される', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Tascal/);
});
