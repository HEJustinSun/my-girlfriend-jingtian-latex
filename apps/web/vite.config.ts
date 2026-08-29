import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { cloudflare } from '@cloudflare/vite-plugin';

// dev 期间监听 apps/bridge 源文件变动，实时重新同步进 public/，
// 否则 /bridge.mjs、/install.sh 会一直服务 predev 时的旧快照。
function watchBridgeAssets(): Plugin {
  return {
    name: 'watch-bridge-assets',
    configureServer(server) {
      const bridgeDir = join(__dirname, '..', 'bridge');
      server.watcher.add([
        join(bridgeDir, 'bridge.mjs'),
        join(bridgeDir, 'install.sh'),
        join(bridgeDir, 'install.ps1'),
      ]);
      server.watcher.on('change', (file) => {
        if (file.startsWith(bridgeDir)) {
          spawnSync(process.execPath, [join(__dirname, 'scripts', 'sync-bridge-assets.mjs')], {
            stdio: 'inherit',
          });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), cloudflare(), watchBridgeAssets()],
});
