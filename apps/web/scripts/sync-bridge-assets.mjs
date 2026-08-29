// 把 apps/bridge 的单文件桥与安装脚本同步进 public/，作为静态资源随站点分发。
// Worker 在响应 /bridge.mjs 与 /install.sh 时把 __SITE_ORIGIN__ 替换为真实站点地址。
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, '..');
const bridgeRoot = join(webRoot, '..', 'bridge');

copyFileSync(join(bridgeRoot, 'bridge.mjs'), join(webRoot, 'public', 'bridge.mjs'));
copyFileSync(join(bridgeRoot, 'install.sh'), join(webRoot, 'public', 'install.sh'));
copyFileSync(join(bridgeRoot, 'install.ps1'), join(webRoot, 'public', 'install.ps1'));

const src = readFileSync(join(bridgeRoot, 'bridge.mjs'), 'utf8');
const version = src.match(/BRIDGE_VERSION = '([^']+)'/)?.[1] ?? '0.0.0';
writeFileSync(join(webRoot, 'public', 'bridge-version.json'), JSON.stringify({ version }) + '\n');
console.log(`[sync-bridge-assets] bridge v${version} → public/`);
