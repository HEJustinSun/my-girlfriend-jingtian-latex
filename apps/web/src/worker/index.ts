import { Hono } from 'hono';
import type { Context } from 'hono';

type DurableObjectStub = { fetch: typeof fetch };
type DurableObjectNamespace = {
  idFromName(name: string): unknown;
  get(id: unknown): DurableObjectStub;
};

type Bindings = {
  ASSETS: { fetch: typeof fetch };
  PRESENCE: DurableObjectNamespace;
};
type AppEnv = { Bindings: Bindings };

declare const WebSocketPair: new () => { 0: WebSocket; 1: WebSocket };

// 实时在线人数：单例 Durable Object，页面开 WebSocket 进来，
// 用 Hibernation API 托管连接（空闲时不计费），人数变化时广播给所有连接。
export class Presence {
  private ctx: {
    acceptWebSocket(ws: WebSocket): void;
    getWebSockets(): (WebSocket & { readyState: number })[];
  };

  constructor(state: never) {
    this.ctx = state;
  }

  private count() {
    return this.ctx.getWebSockets().filter((ws) => ws.readyState === 1).length;
  }

  private broadcast() {
    const msg = JSON.stringify({ count: this.count() });
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(msg);
      } catch {
        // 濒死连接发不出去没关系，close 回调会再广播
      }
    }
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
      return Response.json({ count: this.count() });
    }
    const pair = new WebSocketPair();
    this.ctx.acceptWebSocket(pair[1]);
    this.broadcast();
    return new Response(null, { status: 101, webSocket: pair[0] } as ResponseInit & { webSocket: WebSocket });
  }

  async webSocketClose(ws: WebSocket) {
    try {
      ws.close();
    } catch {}
    this.broadcast();
  }

  async webSocketError(ws: WebSocket) {
    try {
      ws.close();
    } catch {}
    this.broadcast();
  }
}

const app = new Hono<AppEnv>();

// 静态资源模板化：把桥/安装脚本里的 __SITE_ORIGIN__ 替换为当前站点 origin，
// 这样 curl <站点>/install.sh 拿到的脚本天然知道从哪里下载桥、桥知道信任哪个 origin。
function serveTemplated(assetPath: string, contentType: string) {
  return async (c: Context<AppEnv>) => {
    const origin = new URL(c.req.url).origin;
    const res = await c.env.ASSETS.fetch(new Request(new URL(assetPath, origin)));
    // SPA not_found_handling 会把缺失资源 fallback 成 index.html（200 + text/html），必须识别为 404
    if (!res.ok || res.headers.get('content-type')?.includes('text/html')) {
      return c.text('asset not found', 404);
    }
    const body = (await res.text()).replaceAll('__SITE_ORIGIN__', origin);
    return new Response(body, {
      headers: { 'Content-Type': contentType, 'Cache-Control': 'no-cache' },
    });
  };
}

app.get('/install.sh', serveTemplated('/install.sh', 'text/x-shellscript; charset=utf-8'));
app.get('/install.ps1', serveTemplated('/install.ps1', 'text/plain; charset=utf-8'));
app.get('/bridge.mjs', serveTemplated('/bridge.mjs', 'text/javascript; charset=utf-8'));

app.get('/api/presence', (c) => {
  const id = c.env.PRESENCE.idFromName('global');
  return c.env.PRESENCE.get(id).fetch(c.req.raw);
});

// 其余请求全部交给静态资源（SPA fallback 由 assets 配置处理）
app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;
