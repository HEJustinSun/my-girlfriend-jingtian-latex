# 有事问孙哥 · AI 答疑站

> **🌐 在线体验：[sunge.app](https://sunge.app)**
> 你的爱情、事业、搞钱问题，孙哥思维给你答疑解惑。

把孙哥炼化成 AI：网友在网页上跟"孙哥"聊天，回答由**你本地的 agent CLI**
（Claude Code / Codex）生成——本站不做 agent 循环、不管理任何 API Key、
不经手你的对话内容。

**⭐ 觉得好玩请点个 Star**——孙哥说过，花的每一分钱都要让全世界听到响；
你点的每一个 star，都是不花钱的响。

## 怎么玩

1. 打开 [sunge.app](https://sunge.app)
2. 按页面提示跑一条安装命令（macOS / Linux / Windows*），装一个只监听
   `127.0.0.1` 的本地小桥（零依赖单文件，开源可审计，重复执行即升级）
3. 回到网页，选 Claude Code 或 Codex，开聊

*Windows 支持为实验性；也可以用 WSL 走 macOS/Linux 脚本。

## 架构

```
┌─────────────────────────────┐          ┌──────────────────────────────┐
│  Cloudflare Worker (公网)    │          │  用户本机                     │
│  Hono + React + AI SDK      │          │                              │
│                             │  探测/聊天 │  sunge-bridge(127.0.0.1:35827)│
│  · 聊天 UI (useChat)     ────┼──────────▶  · CORS/PNA/Host 三重校验     │
│  · /install.sh(.ps1)        │   SSE     │  · 适配器: claude / codex     │
│  · /bridge.mjs 单文件桥      │◀──────────┼  · CLI 输出 → UI Msg Stream   │
│  · /skills/* 孙哥人设        │          │  · 多轮 resume + 全文重放兜底  │
└─────────────────────────────┘          └──────────┬───────────────────┘
                                                     │ spawn（纯聊天配置）
                                          ┌──────────▼───────────────┐
                                          │ claude -p stream-json     │
                                          │ codex exec --json         │
                                          └──────────────────────────┘
```

关键设计：

- **公网页面 → 本地桥**：Chrome/Edge/Firefox 把 loopback 视为 potentially-trustworthy，
  HTTPS 页面可以直接 fetch `http://127.0.0.1:35827`；桥响应 Chrome 的
  Private Network Access 预检（`Access-Control-Allow-Private-Network: true`）。
  Safari 不放行 → 桥同时把站点**同源镜像**到 `http://127.0.0.1:35827` 作为兜底入口。
- **流协议**：桥把 CLI stdout 归一化为 Vercel AI SDK 的 UI Message Stream（SSE），
  前端用 `@ai-sdk/react` 的 `useChat` + `DefaultChatTransport` 直接消费。
- **适配器即数据**：`apps/bridge/bridge.mjs` 里每个 CLI 一个 def（bin/buildArgs/parser），
  新增 CLI 只需加一个 def + 一个解析器。
  - claude：`-p --output-format stream-json --include-partial-messages --safe-mode
    --system-prompt <人设>`，`--session-id`/`--resume` 做多轮；工具全部 disallow。
  - codex：`exec --json --sandbox read-only`，人设并入首轮 prompt，
    `exec resume <thread-id>` 做多轮（thread id 从 `thread.started` 捕获）。
- **skills 热更新**：人设是站点上的标准 Agent Skill（`apps/web/public/skills/`），
  桥每次会话在线拉取（5 分钟缓存 + 磁盘兜底），改人设不用重装桥。
- **安全**：桥只绑 127.0.0.1；Origin 白名单 + Host 校验（防 DNS rebinding）；
  CLI 以纯聊天配置运行（claude 禁用全部工具、codex read-only sandbox、cwd 为空白工作区）。

## 🤝 贡献指南

欢迎两种贡献，提 PR 即可：

### 1. 贡献你的"孙哥思维 skill"（不用写代码）

我们支持多 skills：核心人设常驻，话题 skills 按需叠加，**你贡献的 skill
合并后会自动出现在网站话题栏**。格式是标准 Agent Skill：

```
apps/web/public/skills/
└── topic-你的话题/
    └── SKILL.md      # YAML frontmatter（name/description）+ 正文
```

三步投稿：

1. 照着 `topic-love/SKILL.md` 的样子，新建 `topic-<id>/SKILL.md`，写下你理解的
   孙哥会怎么答这类问题（孙体文风、独门视角、可用的梗）
2. 在 `apps/web/public/skills/manifest.json` 注册：
   `"topic-<id>": { "name": "话题名", "samples": ["示例问题1", "示例问题2"] }`
3. 提 PR。底线要求：不构成真实投资建议；对真实人物只引用公开内容、不人身攻击；
   保留"用户流露危机信号时跳出角色"的兜底

### 2. 贡献代码

- 新 CLI 适配（Gemini CLI、Qwen Code……）：在 `apps/bridge/bridge.mjs` 加一个
  def + 解析器即可
- Bug 修复 / UI 打磨 / Windows 体验完善，都欢迎

## 目录

- `apps/web` — Cloudflare Worker 站点（Hono worker + React SPA + Vite）
  - `public/skills/` — 孙哥思维 skills（标准 Agent Skill 格式，网站与桥共用）
  - `src/worker/` — Hono：托管静态资源、给安装脚本/桥注入站点 origin
  - `src/client/` — React 聊天 UI（书籍排版风格，呼应《我的女友景甜》原书）
- `apps/bridge` — 本地桥（零依赖单文件 `bridge.mjs`）+ 安装脚本

## 开发

```bash
cd apps/web
pnpm install
pnpm dev            # http://localhost:5173（含 Worker 模拟）

# 另开终端：本地起桥（人设直接读本地 skills 目录）
node ../bridge/bridge.mjs --skills-dir "$PWD/public/skills"
```

## 部署

```bash
cd apps/web
pnpm run deploy     # wrangler deploy
```

## 免责

本站为戏仿娱乐项目：纯属虚构，如有雷同实属巧合；不构成任何投资建议。
对话内容直接从浏览器发往你本机的 CLI，不经过站点服务器。
