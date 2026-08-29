import { useCallback, useEffect, useRef, useState } from 'react';

export type AgentInfo = {
  id: string;
  name: string;
  available: boolean;
  version: string | null;
};

export type BridgeState = {
  status: 'checking' | 'connected' | 'missing';
  base: string; // '' 表示与页面同源（从桥直接打开时）
  version: string | null;
  site: string | null; // 桥所镜像的站点 origin
  agents: AgentInfo[];
  latestVersion: string | null;
  rescan: () => void;
};

export const BRIDGE_PORT = 35827;

function candidates(): string[] {
  const { protocol, hostname, origin } = window.location;
  // 页面本身就是从桥（或本地 dev）同源打开的：优先相对路径
  if (protocol === 'http:' && (hostname === '127.0.0.1' || hostname === 'localhost')) {
    return ['', `http://127.0.0.1:${BRIDGE_PORT}`].filter((b) => b !== origin);
  }
  return [`http://127.0.0.1:${BRIDGE_PORT}`, `http://localhost:${BRIDGE_PORT}`];
}

export function useBridge(): BridgeState {
  const [status, setStatus] = useState<BridgeState['status']>('checking');
  const [base, setBase] = useState('');
  const [version, setVersion] = useState<string | null>(null);
  const [site, setSite] = useState<string | null>(null);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const failStreak = useRef(0);

  const probe = useCallback(async (rescan = false) => {
    for (const b of candidates()) {
      try {
        const r = await fetch(`${b}/api/health`, { signal: AbortSignal.timeout(2000) });
        if (!r.ok) continue;
        const h = (await r.json()) as { name?: string; version?: string; site?: string | null };
        if (h.name !== 'sunge-bridge') continue;
        const ar = await fetch(`${b}/api/agents${rescan ? '?rescan' : ''}`, {
          signal: AbortSignal.timeout(15000),
        });
        const { agents: list } = (await ar.json()) as { agents: AgentInfo[] };
        failStreak.current = 0;
        setBase(b);
        setVersion(h.version ?? null);
        setSite(h.site ?? null);
        setAgents(list);
        setStatus('connected');
        return true;
      } catch {
        // 尝试下一个候选地址
      }
    }
    // 已连接状态下连续两次探测失败（约 1 分钟）才降级，避免单次超时误报"失联"
    failStreak.current += 1;
    setStatus((s) => (s === 'connected' && failStreak.current < 2 ? s : 'missing'));
    return false;
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      await probe();
      // 未连接时轮询，用户装好桥后页面自动亮起来
      const tick = async () => {
        if (!alive) return;
        const ok = await probe();
        timer.current = window.setTimeout(tick, ok ? 30000 : 4000);
      };
      timer.current = window.setTimeout(tick, 4000);
    })();
    fetch('/bridge-version.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((v: { version?: string } | null) => setLatestVersion(v?.version ?? null))
      .catch(() => {});
    return () => {
      alive = false;
      window.clearTimeout(timer.current);
    };
  }, [probe]);

  const rescan = useCallback(() => {
    void probe(true);
  }, [probe]);

  return { status, base, version, site, agents, latestVersion, rescan };
}
