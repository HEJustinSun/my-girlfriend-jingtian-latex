import { useEffect, useState } from 'react';
import { BRIDGE_PORT } from './useBridge';

// 实时在线人数：连站点 Worker 的 /api/presence（Durable Object，WebSocket 推送）。
// 页面从桥的同源镜像（127.0.0.1:35827）打开时，WebSocket 直连桥所镜像的站点。
export function useOnlineCount(bridgeSite: string | null): number | null {
  const [count, setCount] = useState<number | null>(null);

  const { protocol, hostname, port, origin } = window.location;
  const isMirror =
    protocol === 'http:' &&
    (hostname === '127.0.0.1' || hostname === 'localhost') &&
    port === String(BRIDGE_PORT);
  const wsBase = isMirror ? (bridgeSite?.startsWith('https://') ? bridgeSite : null) : origin;

  useEffect(() => {
    if (!wsBase) return;
    let ws: WebSocket | null = null;
    let alive = true;
    let retry: number | undefined;

    const connect = () => {
      if (!alive) return;
      try {
        ws = new WebSocket(`${wsBase.replace(/^http/, 'ws')}/api/presence`);
      } catch {
        return;
      }
      ws.onmessage = (e) => {
        try {
          const d = JSON.parse(String(e.data)) as { count?: number };
          if (typeof d.count === 'number') setCount(d.count);
        } catch {}
      };
      ws.onclose = () => {
        setCount(null);
        if (alive) retry = window.setTimeout(connect, 5000 + Math.random() * 5000);
      };
      ws.onerror = () => ws?.close();
    };
    connect();

    return () => {
      alive = false;
      window.clearTimeout(retry);
      try {
        ws?.close();
      } catch {}
    };
  }, [wsBase]);

  return count;
}
