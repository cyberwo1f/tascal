import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Tascal の開発・ビルド設定
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
});
