import { useEffect, useRef, useState } from 'react';
import { REPO_URL } from '../links';

const isSafari =
  typeof navigator !== 'undefined' &&
  /safari/i.test(navigator.userAgent) &&
  !/chrome|chromium|crios|edg/i.test(navigator.userAgent);

const isWindows = typeof navigator !== 'undefined' && /windows/i.test(navigator.userAgent);

export function InstallPanel() {
  const [copied, setCopied] = useState(false);
  const [os, setOs] = useState<'unix' | 'win'>(isWindows ? 'win' : 'unix');
  const copyTimer = useRef<number | undefined>(undefined);
  const origin = window.location.origin.startsWith('http://127.0.0.1')
    ? '你的站点地址'
    : window.location.origin;
  const cmd =
    os === 'unix'
      ? `curl -fsSL ${origin}/install.sh | sh -s -- --run`
      : `irm ${origin}/install.ps1 | iex`;

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // 剪贴板被拒绝时用户可手动选中复制
    }
  };

  return (
    <div className="install">
      <p className="install-lead">
        孙哥不上云，只借你本地的 CLI 通灵——在终端跑一条命令，装一个只监听 127.0.0.1
        的小桥（零依赖单文件，
        <a href={`${REPO_URL}/tree/main/apps/bridge`} target="_blank" rel="noopener noreferrer">
          开源可审计
        </a>
        ）：
      </p>
      <div className="os-tabs">
        <button className={`os-tab ${os === 'unix' ? 'os-tab-on' : ''}`} onClick={() => setOs('unix')}>
          macOS / Linux
        </button>
        <button className={`os-tab ${os === 'win' ? 'os-tab-on' : ''}`} onClick={() => setOs('win')}>
          Windows
        </button>
      </div>
      <div className="terminal">
        <code>{cmd}</code>
        <button className="copy" onClick={copy}>
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <ol className="install-steps">
        <li>
          桥启动后，本页会自动亮起（浏览器若弹出「访问本地网络」权限，请允许）
          {os === 'win' && '；Windows 装完后在终端跑 sunge 启动，支持为实验性'}
        </li>
        <li>
          前提：本机已装并登录过 <strong>Claude Code</strong>（<code>claude</code>）或{' '}
          <strong>Codex</strong>（<code>codex</code>）任意一个
        </li>
        <li>
          之后每次使用，终端里跑 <code>sunge</code> 即可；重跑安装命令即升级，卸载删除{' '}
          <code>~/.sunge</code> 目录即可
        </li>
      </ol>
      {isSafari && (
        <p className="install-safari">
          检测到 Safari：装好并启动桥之后，请直接打开{' '}
          <a href="http://127.0.0.1:35827">http://127.0.0.1:35827</a>
          （同一个页面的本地同源版，Safari 不允许公网页面连本地端口）。
        </p>
      )}
    </div>
  );
}
