// `pnpm overview`（= vite docs）専用の最小設定。
// 目的: 起動ログに overview.html の完全 URL を出し、毎回 `/overview.html` を手打ちしなくて済むようにする。
// ここではプラグインを1つ足すだけで、配信内容（base やトランスフォーム）は素の静的配信のまま変えない。
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      name: 'tascal-overview-url',
      // dev サーバー起動時、Vite 標準の Local/Network 行のあとに overview.html への完全 URL を追記する。
      configureServer(server) {
        const printUrls = server.printUrls.bind(server)
        server.printUrls = () => {
          printUrls()
          // resolvedUrls.local は ['http://localhost:5180/'] のような末尾スラッシュ付き URL。
          const local = server.resolvedUrls?.local?.[0]
          if (local) {
            // 緑の矢印 + シアンの URL（Vite の表示色に合わせる）
            server.config.logger.info(
              `  \x1b[32m➜\x1b[0m  \x1b[1mOverview\x1b[0m: \x1b[36m${local}overview.html\x1b[0m`,
            )
          }
        }
      },
    },
  ],
})
