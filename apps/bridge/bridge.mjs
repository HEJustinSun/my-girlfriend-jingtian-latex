#!/usr/bin/env node
// 孙哥桥 sunge-bridge — 零依赖单文件本地桥接。
// 网页(公网 HTTPS) → http://127.0.0.1:PORT → 本地 agent CLI (claude / codex)。
// 输出 Vercel AI SDK UI Message Stream (SSE)，前端用 @ai-sdk/react useChat 直接消费。
// 安全模型：仅绑定 loopback；Origin/Host 双重校验；CLI 以"纯聊天"配置运行（不授予工具权限）。

import { createServer } from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline';

export const BRIDGE_VERSION = '0.2.0';

// 部署时由 Worker 把 __SITE_ORIGIN__ 替换为真实站点 origin；直接从仓库运行时用 --site 或 SUNGE_SITE 指定。
const INJECTED_SITE = '__SITE_ORIGIN__';
// 官方站点永远在白名单里：从 workers.dev 预览域下载的桥也能服务 sunge.app 的页面
const CANONICAL_SITE = 'https://sunge.app';

const IS_WIN = process.platform === 'win32';

// ---------- 配置 ----------
const args = process.argv.slice(2);
function argValue(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}
if (args.includes('--version') || args.includes('-v')) {
  console.log(BRIDGE_VERSION);
  process.exit(0);
}

const PORT = Number(argValue('--port') || process.env.SUNGE_PORT || 35827); // 35827 = 3.5微克 + 0827
const HOST = argValue('--host') || '127.0.0.1';
const siteFromInjection = INJECTED_SITE.startsWith('__') ? null : INJECTED_SITE;
const SITE = (argValue('--site') || process.env.SUNGE_SITE || siteFromInjection || '').replace(/\/$/, '') || null;
const SKILLS_DIR = argValue('--skills-dir') || process.env.SUNGE_SKILLS_DIR || null;
const IDLE_KILL_MS = 10 * 60 * 1000; // CLI 挂死兜底：10 分钟无输出强杀

const DATA_DIR = join(homedir(), '.sunge');
const WORK_DIR = join(DATA_DIR, 'workspace'); // CLI 的 cwd：空白工作区，聊天不触碰用户文件
mkdirSync(WORK_DIR, { recursive: true });

const ALLOWED_ORIGINS = new Set(
  [SITE, CANONICAL_SITE, `http://127.0.0.1:${PORT}`, `http://localhost:${PORT}`].filter(Boolean),
);
// 仅开发形态（本地 skills 目录 / 未注入站点 / 站点本身就是本地）才信任 Vite dev 源
if (SKILLS_DIR || !SITE || /^http:\/\/(localhost|127\.0\.0\.1)(:|$)/.test(SITE)) {
  ALLOWED_ORIGINS.add('http://localhost:5173');
  ALLOWED_ORIGINS.add('http://127.0.0.1:5173');
}
for (const extra of (process.env.SUNGE_EXTRA_ORIGINS || '').split(',')) {
  if (extra.trim()) ALLOWED_ORIGINS.add(extra.trim().replace(/\/$/, ''));
}

// 本地常驻小服务：单个坏请求/极端边界不应带崩所有会话，记录后继续活着
process.on('uncaughtException', (e) => console.error('[sunge] uncaughtException:', e));
process.on('unhandledRejection', (e) => console.error('[sunge] unhandledRejection:', e));

// ---------- Windows 兼容 ----------
// npm 全局安装的 CLI 在 Windows 上是 .cmd shim，Node 的 spawn 不经 shell 无法直接执行。
// 用 where.exe 解析真实路径：.exe 直接 spawn；.cmd/.bat 经 cmd.exe 包一层。
// 注意：Windows 路径上所有 argv 都必须是"固定 token"（不含用户可控文本），避免 cmd 转义问题——
// 因此 Windows 上人设不走 --system-prompt，而是并入 stdin prompt（见 handleChat）。
const winBinCache = new Map();
function resolveWinBin(bin) {
  if (winBinCache.has(bin)) return winBinCache.get(bin);
  let resolved = null;
  try {
    const r = spawnSync('where.exe', [bin], { encoding: 'utf8', timeout: 5000 });
    if (r.status === 0) {
      const lines = r.stdout.trim().split(/\r?\n/).filter(Boolean);
      resolved = lines.find((l) => /\.exe$/i.test(l)) || lines[0] || null;
    }
  } catch {}
  winBinCache.set(bin, resolved);
  return resolved;
}

function spawnCli(bin, argv, opts) {
  if (!IS_WIN) return spawn(bin, argv, opts);
  const resolved = resolveWinBin(bin);
  if (resolved && /\.exe$/i.test(resolved)) return spawn(resolved, argv, opts);
  if (resolved) {
    // .cmd/.bat：经 cmd.exe 执行；argv 均为受控 token，仅需处理含空格的路径
    const quote = (s) => (/[\s]/.test(s) ? `"${s}"` : s);
    const line = [quote(resolved), ...argv.map(quote)].join(' ');
    return spawn('cmd.exe', ['/d', '/s', '/c', line], { ...opts, windowsVerbatimArguments: true });
  }
  return spawn(bin, argv, opts); // 交给 spawn 报 ENOENT
}

function killTree(child) {
  try {
    if (!IS_WIN) process.kill(-child.pid, 'SIGTERM');
    else spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  } catch {}
}

// ---------- CLI 适配器：每个 CLI 一个纯数据 def，新增 CLI 只需加 def + 解析器 ----------
const AGENT_DEFS = [
  {
    id: 'claude',
    name: 'Claude Code',
    bin: 'claude',
    versionArgs: ['--version'],
    // 首轮：--session-id 固定会话；续轮：--resume。人设走 --system-prompt（Windows 上并入 prompt）。
    systemPromptViaArgv: !IS_WIN,
    buildArgs({ resumeId, newSessionId, systemPrompt }) {
      const a = [
        '-p',
        '--output-format', 'stream-json',
        '--verbose',
        '--include-partial-messages',
        '--safe-mode',
        '--disallowedTools', 'Bash,Edit,Write,NotebookEdit,Read,Glob,Grep,WebFetch,WebSearch,Task,Agent,TodoWrite,Skill,KillShell,AskUserQuestion',
      ];
      if (systemPrompt) a.push('--system-prompt', systemPrompt);
      if (resumeId) a.push('--resume', resumeId);
      else a.push('--session-id', newSessionId);
      return a;
    },
    parser: 'claude-stream-json',
  },
  {
    id: 'codex',
    name: 'Codex CLI',
    bin: 'codex',
    versionArgs: ['--version'],
    // codex 无 system prompt 参数：人设并入首轮 prompt；续轮 exec resume（不接受 --sandbox/-C，改 -c sandbox_mode）。
    systemPromptViaArgv: false,
    buildArgs({ resumeId }) {
      const common = ['--json', '--skip-git-repo-check'];
      if (resumeId) {
        return ['exec', 'resume', resumeId, ...common, '-c', 'sandbox_mode=read-only', '-'];
      }
      return ['exec', ...common, '--sandbox', 'read-only', '-C', WORK_DIR, '-'];
    },
    parser: 'codex-jsonl',
  },
];

// ---------- CLI 探测（异步，不阻塞在途 SSE 流） ----------
let detected = null;
function probeAgent(def) {
  return new Promise((resolve) => {
    let out = '';
    let settled = false;
    const settle = (ok) => {
      if (settled) return;
      settled = true;
      resolve({ id: def.id, name: def.name, available: ok, version: ok ? out.trim().split('\n')[0] : null });
    };
    let p;
    try {
      p = spawnCli(def.bin, def.versionArgs, { stdio: ['ignore', 'pipe', 'ignore'] });
    } catch {
      return settle(false);
    }
    const timer = setTimeout(() => {
      try { p.kill(); } catch {}
      settle(false);
    }, 10000);
    p.stdout.on('data', (d) => { out += d; });
    p.on('error', () => { clearTimeout(timer); settle(false); });
    p.on('close', (code) => { clearTimeout(timer); settle(code === 0); });
  });
}
async function detectAgents(force = false) {
  if (detected && !force) return detected;
  if (force) winBinCache.clear();
  detected = await Promise.all(AGENT_DEFS.map(probeAgent));
  return detected;
}

// ---------- 孙哥 skills（标准 Agent Skill 格式：skills/<id>/SKILL.md，站点在线拉取热更新） ----------
const skillsCacheFile = join(DATA_DIR, 'skills-cache.json');
let skillsMem = null; // { at, manifest, files: {id: bodyText} }

const FALLBACK_PERSONA = `你是"孙哥"——网友用《我的女友景甜》开源仓库炼化出来的 AI 戏仿人格（不是真实的孙宇晨本人）。
用孙体回答：短句，金钱量化一切，凡尔赛与抠门并存，重大决策问 AI。名梗："Claude 说，不要把这五千万美元给她。"
"一颗卵子的重量，三点五微克。五千万美元现金的重量，两点五吨。""凌晨三点的香港，什么都没有发生。"
规则：真正解决用户的问题再玩梗；不给任何真实投资建议；对真实人物只引用公开原文、不人身攻击；
用户流露危机信号时跳出角色建议寻求专业帮助。回答默认 300 字以内，结尾可挂一句"本回答纯属虚构"。`;

// SKILL.md 的 YAML frontmatter 只是给人和工具看的元数据，注入 system prompt 前剥掉
function stripFrontmatter(text) {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trim();
}

async function loadSkills() {
  if (skillsMem && Date.now() - skillsMem.at < 5 * 60 * 1000) return skillsMem;
  // 开发模式：直接读本地目录
  if (SKILLS_DIR) {
    try {
      const manifest = JSON.parse(readFileSync(join(SKILLS_DIR, 'manifest.json'), 'utf8'));
      const files = {};
      for (const id of Object.keys(manifest.skills)) {
        files[id] = stripFrontmatter(readFileSync(join(SKILLS_DIR, id, 'SKILL.md'), 'utf8'));
      }
      skillsMem = { at: Date.now(), manifest, files };
      return skillsMem;
    } catch (e) {
      console.error('[sunge] 本地 skills 读取失败:', e.message);
    }
  }
  if (SITE) {
    try {
      const manifest = await (await fetch(`${SITE}/skills/manifest.json`)).json();
      const files = {};
      await Promise.all(
        Object.keys(manifest.skills).map(async (id) => {
          if (!/^[a-z0-9-]+$/.test(id)) return;
          const r = await fetch(`${SITE}/skills/${id}/SKILL.md`);
          if (!r.ok) throw new Error(`skill ${id} http ${r.status}`);
          files[id] = stripFrontmatter(await r.text());
        }),
      );
      skillsMem = { at: Date.now(), manifest, files };
      try { writeFileSync(skillsCacheFile, JSON.stringify(skillsMem)); } catch {}
      return skillsMem;
    } catch (e) {
      console.error('[sunge] 站点 skills 拉取失败，尝试本地缓存:', e.message);
    }
  }
  try {
    skillsMem = JSON.parse(readFileSync(skillsCacheFile, 'utf8'));
    return skillsMem;
  } catch {
    return null;
  }
}

async function composeSystemPrompt(topicId) {
  const skills = await loadSkills();
  if (!skills) return FALLBACK_PERSONA;
  const parts = [];
  for (const [id, meta] of Object.entries(skills.manifest.skills)) {
    if (meta.always && skills.files[id]) parts.push(skills.files[id]);
  }
  if (topicId && /^[a-z0-9-]+$/.test(topicId) && skills.files[topicId] && !skills.manifest.skills[topicId]?.always) {
    parts.push(skills.files[topicId]);
  }
  parts.push('补充硬规则：你在纯聊天模式下运行，直接用文字回答，绝不要尝试使用任何工具、读写任何文件或执行任何命令。');
  return parts.join('\n\n---\n\n') || FALLBACK_PERSONA;
}

// ---------- 会话表：chatId → CLI 原生会话，桥重启后自动降级为全文重放 ----------
const sessions = new Map(); // chatId -> { agentId, ref }
const activeRuns = new Map(); // chatId -> cancel()，同一会话新请求到来时替换旧的

function transcriptPrompt(messages, systemPrompt, includeSystem) {
  // 无法 resume 时的兜底：把整段对话压平成一个 prompt
  const lines = [];
  if (includeSystem) lines.push(`<系统设定>\n${systemPrompt}\n</系统设定>`);
  const prior = messages.slice(0, -1);
  if (prior.length) {
    lines.push('以下是你（孙哥）与用户此前的对话记录：');
    for (const m of prior) {
      const text = uiMessageText(m);
      if (text) lines.push(`${m.role === 'user' ? '用户' : '孙哥'}：${text}`);
    }
  }
  const last = messages[messages.length - 1];
  lines.push(`${prior.length ? '现在用户说' : '用户说'}：${uiMessageText(last)}`);
  lines.push('请以孙哥身份直接回复这条消息。');
  return lines.join('\n\n');
}

function uiMessageText(m) {
  if (!m) return '';
  if (typeof m.content === 'string') return m.content;
  return (m.parts || [])
    .filter((p) => p.type === 'text')
    .map((p) => p.text)
    .join('\n');
}

// ---------- SSE（AI SDK UI Message Stream v1） ----------
function sseHeaders(origin) {
  return {
    ...corsHeaders(origin),
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
    'x-vercel-ai-ui-message-stream': 'v1',
  };
}
function sseWrite(res, obj) {
  try {
    res.write(`data: ${typeof obj === 'string' ? obj : JSON.stringify(obj)}\n\n`);
  } catch {}
}

// ---------- CLI 输出 → UI Message Stream 解析器 ----------
function makeUiEmitter(res) {
  let openText = null; // 当前 text block id
  let openReasoning = null;
  let counter = 0;
  let textEmitted = false;
  let errored = false;
  const emit = (obj) => sseWrite(res, obj);
  return {
    text(delta) {
      if (!delta) return;
      if (openReasoning) this.closeReasoning();
      if (!openText) {
        openText = `t${counter++}`;
        emit({ type: 'text-start', id: openText });
      }
      textEmitted = true;
      emit({ type: 'text-delta', id: openText, delta });
    },
    reasoning(delta) {
      if (!delta) return;
      if (openText) this.closeText();
      if (!openReasoning) {
        openReasoning = `r${counter++}`;
        emit({ type: 'reasoning-start', id: openReasoning });
      }
      emit({ type: 'reasoning-delta', id: openReasoning, delta });
    },
    closeText() {
      if (openText) { emit({ type: 'text-end', id: openText }); openText = null; }
    },
    closeReasoning() {
      if (openReasoning) { emit({ type: 'reasoning-end', id: openReasoning }); openReasoning = null; }
    },
    closeAll() { this.closeReasoning(); this.closeText(); },
    error(message) { this.closeAll(); errored = true; emit({ type: 'error', errorText: message }); },
    hasStreamedText: () => textEmitted,
    hasErrored: () => errored,
  };
}

const PARSERS = {
  // claude -p --output-format stream-json --include-partial-messages
  'claude-stream-json': (ui, onSessionRef) => {
    let sawTextPartial = false;
    let sawThinkingPartial = false;
    return (line) => {
      let ev;
      try { ev = JSON.parse(line); } catch { return; }
      if (ev.type === 'system' && ev.subtype === 'init' && ev.session_id) onSessionRef(ev.session_id);
      else if (ev.type === 'stream_event' && ev.event) {
        const e = ev.event;
        if (e.type === 'content_block_delta' && e.delta) {
          if (e.delta.type === 'text_delta') { sawTextPartial = true; ui.text(e.delta.text); }
          else if (e.delta.type === 'thinking_delta') { sawThinkingPartial = true; ui.reasoning(e.delta.thinking); }
        } else if (e.type === 'content_block_stop') {
          ui.closeAll();
        }
      } else if (ev.type === 'assistant' && ev.message) {
        // 没有 partial 事件的老版本 CLI：按类型分别降级为整块输出，避免和已流式的内容重复
        for (const block of ev.message.content || []) {
          if (block.type === 'text' && !sawTextPartial) ui.text(block.text);
          else if (block.type === 'thinking' && !sawThinkingPartial) ui.reasoning(block.thinking);
        }
        ui.closeAll();
      } else if (ev.type === 'result') {
        if (ev.session_id) onSessionRef(ev.session_id);
        if (!ui.hasStreamedText() && typeof ev.result === 'string' && ev.subtype === 'success' && !ev.is_error) {
          ui.text(ev.result);
        }
        if (ev.is_error) ui.error(String(ev.result || 'CLI 执行出错'));
        ui.closeAll();
      }
    };
  },
  // codex exec --json （thread/turn/item 事件流）
  'codex-jsonl': (ui, onSessionRef) => {
    const emitted = new Map(); // itemId -> 已输出的文本长度
    const handleItem = (item) => {
      if (!item) return;
      const itemType = item.item_type || item.type;
      const id = item.id || 'item';
      if (itemType === 'agent_message' || itemType === 'assistant_message') {
        const text = item.text ?? item.message ?? '';
        const prev = emitted.get(id) || 0;
        if (text.length > prev) { ui.text(text.slice(prev)); emitted.set(id, text.length); }
      } else if (itemType === 'reasoning') {
        const text = item.text ?? item.summary ?? '';
        const prev = emitted.get(id) || 0;
        if (text.length > prev) { ui.reasoning(text.slice(prev)); emitted.set(id, text.length); }
      }
    };
    return (line) => {
      let ev;
      try { ev = JSON.parse(line); } catch { return; }
      const t = ev.type;
      if (t === 'thread.started' && ev.thread_id) onSessionRef(ev.thread_id);
      else if (t === 'item.started' || t === 'item.updated' || t === 'item.completed') handleItem(ev.item);
      else if (t === 'error') ui.error(String(ev.message || 'codex 出错'));
      else if (t === 'turn.failed') ui.error(String(ev.error?.message || 'codex turn 失败'));
      else if (t === 'turn.completed') ui.closeAll();
    };
  },
};

// ---------- 聊天处理 ----------
async function handleChat(req, res, origin, body) {
  const { id: chatId = randomUUID(), messages = [], agentId = 'claude', topicId = null } = body;
  const def = AGENT_DEFS.find((d) => d.id === agentId);
  if (!def) return json(res, 400, { error: `未知 agent: ${agentId}` }, origin);
  if (!Array.isArray(messages) || messages.length === 0) return json(res, 400, { error: 'messages 为空' }, origin);

  // 同一会话只允许一个在途请求：新的到来先取消旧的（与 useChat 的行为一致）
  const prevCancel = activeRuns.get(chatId);
  if (prevCancel) prevCancel();

  const systemPrompt = await composeSystemPrompt(topicId);
  const stored = sessions.get(chatId);
  const canResume = stored && stored.agentId === agentId && stored.ref;
  const resumeId = canResume ? stored.ref : null;
  const newSessionId = randomUUID();

  let prompt;
  if (resumeId) {
    prompt = uiMessageText(messages[messages.length - 1]);
  } else {
    // 首轮（或桥重启/切换 CLI 后降级）：能走 argv 的 CLI 人设走 --system-prompt，否则并入 prompt
    prompt = transcriptPrompt(messages, systemPrompt, !def.systemPromptViaArgv);
  }

  const argv = def.buildArgs({
    resumeId,
    newSessionId,
    systemPrompt: def.systemPromptViaArgv ? systemPrompt : null,
  });

  res.writeHead(200, sseHeaders(origin));
  sseWrite(res, { type: 'start' });
  const ui = makeUiEmitter(res);

  const child = spawnCli(def.bin, argv, {
    cwd: WORK_DIR,
    env: process.env,
    stdio: ['pipe', 'pipe', 'pipe'],
    detached: !IS_WIN, // 独立进程组，取消时整组杀掉（Windows 走 taskkill /T）
  });
  // EPIPE（CLI 提前退出/被杀时 stdin 尚未写完）不能带崩整个桥
  child.stdin.on('error', () => {});

  const keepalive = setInterval(() => { try { res.write(': ping\n\n'); } catch {} }, 15000);
  let watchdog = null;
  let finished = false;

  const cleanup = () => {
    clearInterval(keepalive);
    if (watchdog) clearTimeout(watchdog);
    if (activeRuns.get(chatId) === cancel) activeRuns.delete(chatId);
  };

  const finish = (errText) => {
    if (finished) return;
    finished = true;
    cleanup();
    ui.closeAll();
    if (errText && !ui.hasErrored()) sseWrite(res, { type: 'error', errorText: errText });
    sseWrite(res, { type: 'finish' });
    sseWrite(res, '[DONE]');
    try { res.end(); } catch {}
  };

  // 客户端断开 / 被同会话新请求顶替：杀 CLI 进程组，停止一切
  const cancel = () => {
    if (finished) return;
    finished = true;
    cleanup();
    killTree(child);
    try { res.end(); } catch {}
  };
  activeRuns.set(chatId, cancel);
  // 注意监听 res 而非 req：body 读完后 req 早已 'close'，只有 res 的 'close' 才代表连接断开
  res.on('close', cancel);

  const armWatchdog = () => {
    if (watchdog) clearTimeout(watchdog);
    watchdog = setTimeout(() => {
      killTree(child);
      finish(`${def.name} 超过 ${IDLE_KILL_MS / 60000} 分钟无输出，已终止`);
    }, IDLE_KILL_MS);
  };
  armWatchdog();

  const onSessionRef = (ref) => sessions.set(chatId, { agentId, ref });

  const parse = PARSERS[def.parser](ui, onSessionRef);
  createInterface({ input: child.stdout }).on('line', (l) => {
    armWatchdog();
    if (l.trim()) parse(l);
  });

  let stderrBuf = '';
  child.stderr.on('data', (d) => { stderrBuf += d; if (stderrBuf.length > 20000) stderrBuf = stderrBuf.slice(-20000); });

  child.on('error', (e) => {
    finish(e.code === 'ENOENT' ? `找不到 ${def.bin} 命令，请确认已安装 ${def.name}` : `启动 ${def.name} 失败: ${e.message}`);
  });
  child.on('close', (code) => {
    if (code !== 0 && !finished) {
      // resume 失败常见于会话文件丢失：清掉映射，下一轮自动降级为全文重放
      if (resumeId) sessions.delete(chatId);
      finish(`${def.name} 退出码 ${code}${stderrBuf ? `：${stderrBuf.slice(-500)}` : ''}`);
    } else finish();
  });

  child.stdin.write(prompt, () => {
    try { child.stdin.end(); } catch {}
  });
}

// ---------- HTTP 基础设施 ----------
function corsHeaders(origin) {
  const h = {
    Vary: 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    // Chrome Local Network Access / Private Network Access 预检
    'Access-Control-Allow-Private-Network': 'true',
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) h['Access-Control-Allow-Origin'] = origin;
  return h;
}

function json(res, status, obj, origin) {
  if (res.headersSent) {
    try { res.end(); } catch {}
    return;
  }
  res.writeHead(status, { ...corsHeaders(origin), 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

function hostAllowed(req) {
  const host = (req.headers.host || '').toLowerCase();
  return host === `127.0.0.1:${PORT}` || host === `localhost:${PORT}` || host === `[::1]:${PORT}`;
}
function originAllowed(origin) {
  if (!origin) return true; // 非浏览器调用（curl 等）；服务只绑 loopback
  return ALLOWED_ORIGINS.has(origin);
}

class BodyError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 2 * 1024 * 1024) throw new BodyError(413, '请求体过大');
    chunks.push(c);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    throw new BodyError(400, '请求体不是合法 JSON');
  }
}

// Safari 等不放行"HTTPS 页面 → http://127.0.0.1"的浏览器：把站点镜像成同源
async function proxySite(req, res, path) {
  if (!SITE) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<meta charset="utf-8"><p>孙哥桥已运行。未配置站点地址（--site），无法镜像前端页面。</p>');
    return;
  }
  try {
    const upstream = await fetch(`${SITE}${path}`, { redirect: 'follow' });
    const headers = { 'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream' };
    const cc = upstream.headers.get('cache-control');
    if (cc) headers['Cache-Control'] = cc;
    res.writeHead(upstream.status, headers);
    res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch (e) {
    res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`镜像站点失败: ${e.message}`);
  }
}

const server = createServer(async (req, res) => {
  const origin = req.headers.origin;
  try {
    if (!hostAllowed(req)) return json(res, 403, { error: 'Host 校验失败' }, origin);

    let url;
    try {
      url = new URL(req.url, `http://${req.headers.host}`);
    } catch {
      return json(res, 400, { error: '非法请求' }, origin);
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(204, corsHeaders(origin));
      return res.end();
    }

    if (url.pathname.startsWith('/api/')) {
      if (!originAllowed(origin)) return json(res, 403, { error: 'Origin 不在白名单' }, origin);
      if (url.pathname === '/api/health') {
        return json(res, 200, { ok: true, name: 'sunge-bridge', version: BRIDGE_VERSION, site: SITE }, origin);
      }
      if (url.pathname === '/api/agents') {
        return json(res, 200, { agents: await detectAgents(url.searchParams.has('rescan')) }, origin);
      }
      if (url.pathname === '/api/chat' && req.method === 'POST') {
        let body;
        try {
          body = await readBody(req);
        } catch (e) {
          return json(res, e.status || 400, { error: e.message }, origin);
        }
        return await handleChat(req, res, origin, body);
      }
      return json(res, 404, { error: 'not found' }, origin);
    }

    // 其余路径：同源镜像站点（Safari 兜底入口 http://127.0.0.1:PORT）
    return await proxySite(req, res, url.pathname === '/' ? '/' : url.pathname + url.search);
  } catch (e) {
    console.error('[sunge] 请求处理异常:', e);
    return json(res, 500, { error: e.message }, origin);
  }
});

server.listen(PORT, HOST, async () => {
  const agents = await detectAgents();
  const found = agents.filter((a) => a.available).map((a) => `${a.name}(${a.version})`).join('、') || '无';
  console.log(`
  孙哥桥 sunge-bridge v${BRIDGE_VERSION}
  ────────────────────────────────────
  监听        http://${HOST}:${PORT}
  站点        ${SITE || '(未配置，--site 指定)'}
  检测到 CLI  ${found}

  · 回到网页即可开聊${SITE ? `：${SITE}` : ''}
  · Safari 用户请直接打开 http://127.0.0.1:${PORT}
  · Ctrl+C 退出
`);
});
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`端口 ${PORT} 已被占用。孙哥桥可能已在运行；或用 --port 换一个端口。`);
    process.exit(1);
  }
  throw e;
});
