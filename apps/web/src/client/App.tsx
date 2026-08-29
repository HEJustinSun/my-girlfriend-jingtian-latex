import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useBridge } from './useBridge';
import { useOnlineCount } from './useOnlineCount';
import { InstallPanel } from './components/InstallPanel';
import { Messages } from './components/Messages';
import { EPIGRAPHS, FALLBACK_TOPICS, LOADING_LINES, pick, type Topic } from './quotes';
import { REPO_URL } from './links';

function usePath() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const on = () => setPath(window.location.pathname);
    window.addEventListener('popstate', on);
    return () => window.removeEventListener('popstate', on);
  }, []);
  const nav = useCallback((p: string) => {
    if (window.location.pathname !== p) window.history.pushState(null, '', p);
    setPath(p);
  }, []);
  return { path, nav };
}

// 话题来自站点的 skills/manifest.json：社区贡献新 skill 后 UI 自动出现新话题
function useTopics(): Topic[] {
  const [topics, setTopics] = useState<Topic[]>(FALLBACK_TOPICS);
  useEffect(() => {
    fetch('/skills/manifest.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((m: { skills?: Record<string, { name: string; always?: boolean; samples?: string[] }> } | null) => {
        if (!m?.skills) return;
        const list = Object.entries(m.skills)
          .filter(([, s]) => !s.always)
          .map(([id, s]) => ({ id, name: s.name, samples: s.samples ?? [] }));
        if (list.length) setTopics(list);
      })
      .catch(() => {});
  }, []);
  return topics;
}

export function App() {
  const bridge = useBridge();
  const online = useOnlineCount(bridge.site);
  const topics = useTopics();
  const { path, nav } = usePath();
  const [agentId, setAgentId] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [chatKey, setChatKey] = useState(() => crypto.randomUUID());
  const agentRef = useRef<string | null>(null);
  const topicRef = useRef<string | null>(null);

  const epigraph = useMemo(() => pick(EPIGRAPHS), []);
  const loadingLine = useMemo(() => pick(LOADING_LINES), []);

  // 自动选中第一个可用 CLI
  const available = bridge.agents.filter((a) => a.available);
  const activeAgent = agentId && available.some((a) => a.id === agentId) ? agentId : (available[0]?.id ?? null);

  // transport 的 body() 闭包通过 ref 拿最新值；写入放在 effect 里，避免 render 阶段副作用
  useEffect(() => {
    agentRef.current = activeAgent;
    topicRef.current = topicId;
  }, [activeAgent, topicId]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${bridge.base}/api/chat`,
        body: () => ({ agentId: agentRef.current, topicId: topicRef.current }),
      }),
    [bridge.base],
  );

  const { messages, sendMessage, status, error, stop, setMessages } = useChat({ id: chatKey, transport });

  const busy = status === 'submitted' || status === 'streaming';
  const ready = bridge.status === 'connected' && !!activeAgent;
  const inChat = path === '/chat';

  const ask = (text: string) => {
    const t = text.trim();
    if (!t || !ready || busy) return;
    void sendMessage({ text: t });
    setInput('');
    nav('/chat');
  };

  const newChat = () => {
    void stop();
    setMessages([]);
    setChatKey(crypto.randomUUID());
    setInput('');
  };

  return (
    <div className={`page ${inChat ? 'page-chatting' : ''}`}>
      <header className="masthead">
        <div className="masthead-meta">
          {online !== null && online > 0 && (
            <span className="online">
              <span className="online-dot" />
              此刻 {online} 人正在问孙哥
            </span>
          )}
          <a className="gh-link" href={REPO_URL} target="_blank" rel="noopener noreferrer">
            GitHub 开源 · 求个 Star
          </a>
        </div>
        <h1 className="title">
          <a
            className="title-link"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              nav('/');
            }}
            title="回到主页"
          >
            <span className="title-ink">有事问</span>
            <span className="title-red">孙哥</span>
          </a>
        </h1>
        {inChat && (
          <div className="chat-actions">
            <button className="chat-action" onClick={() => nav('/')}>
              主页
            </button>
            <button className="chat-action" onClick={newChat} disabled={messages.length === 0}>
              新对话
            </button>
          </div>
        )}
        <p className="byline">
          网友据《我的女友景甜》开源仓库集体炼化 · 借你本地的 Claude Code / Codex 通灵
        </p>
      </header>

      {!inChat && (
        <blockquote className="epigraph">
          <span className="nbreak">- - -</span>
          <p>{epigraph}</p>
          <span className="nbreak">- - -</span>
        </blockquote>
      )}

      <section className="console">
        <div className="console-row">
          <span className={`lamp lamp-${bridge.status}`} />
          {bridge.status === 'checking' && <span className="console-text">正在探测本地孙哥桥……</span>}
          {bridge.status === 'connected' && (
            <span className="console-text">
              孙哥桥已连接 v{bridge.version}
              {bridge.latestVersion && bridge.version !== bridge.latestVersion && (
                <em className="console-hint">（有新版 v{bridge.latestVersion}，重跑安装命令即可升级）</em>
              )}
            </span>
          )}
          {bridge.status === 'missing' && <span className="console-text">未检测到本地孙哥桥</span>}
          {bridge.status === 'connected' && (
            <div className="agent-picker">
              {bridge.agents.map((a) => (
                <button
                  key={a.id}
                  className={`agent-pill ${a.id === activeAgent ? 'agent-pill-on' : ''}`}
                  disabled={!a.available}
                  title={a.available ? a.version ?? '' : `未检测到 ${a.name}`}
                  onClick={() => setAgentId(a.id)}
                >
                  {a.name}
                  {!a.available && <span className="agent-off">未装</span>}
                </button>
              ))}
              <button className="agent-rescan" onClick={bridge.rescan} title="重新扫描本地 CLI">
                ↻
              </button>
            </div>
          )}
        </div>
        {bridge.status === 'connected' && available.length === 0 && (
          <p className="console-warn">
            桥已连接，但没有检测到可用的 CLI。请安装 Claude Code 或 Codex 后点 ↻ 重扫。
          </p>
        )}
        {bridge.status === 'missing' && <InstallPanel />}
      </section>

      {!inChat && (
        <section className="topics">
          <div className="topic-chips">
            {topics.map((t) => (
              <button
                key={t.id}
                className={`chip ${topicId === t.id ? 'chip-on' : ''}`}
                onClick={() => setTopicId(topicId === t.id ? null : t.id)}
              >
                {t.name}
              </button>
            ))}
          </div>
          <div className="samples">
            {(topicId ? topics.filter((t) => t.id === topicId) : topics).flatMap((t) =>
              t.samples.map((s) => (
                <button
                  key={s}
                  className="sample"
                  disabled={!ready || busy}
                  onClick={() => {
                    setTopicId(t.id);
                    topicRef.current = t.id;
                    ask(s);
                  }}
                >
                  {s}
                </button>
              )),
            )}
          </div>
          {messages.length > 0 && (
            <p className="resume-chat">
              <button className="resume-chat-btn" onClick={() => nav('/chat')}>
                ← 继续刚才的对话（{messages.length} 条）
              </button>
            </p>
          )}
        </section>
      )}

      {inChat && <Messages messages={messages} busy={busy} loadingLine={loadingLine} />}

      {inChat && error && (
        <div className="chat-error">
          <span className="nbreak">- - -</span>
          <p>出错了：{error.message}</p>
          <span className="nbreak">- - -</span>
        </div>
      )}

      <footer className="composer-wrap">
        <div className="composer">
          <textarea
            value={input}
            rows={1}
            placeholder={
              ready
                ? topicId
                  ? `向孙哥请教${topics.find((t) => t.id === topicId)?.name ?? ''}问题……`
                  : '你的爱情、事业、搞钱问题，孙哥在听……'
                : bridge.status === 'connected'
                  ? '未检测到可用 CLI'
                  : '先安装上面的孙哥桥，才能开聊'
            }
            disabled={!ready}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // keyCode 229：Safari 输入法组词中的 Enter，不应触发发送
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                e.preventDefault();
                ask(input);
              }
            }}
          />
          {busy ? (
            <button className="send send-stop" onClick={() => void stop()}>
              停
            </button>
          ) : (
            <button className="send" disabled={!ready || !input.trim()} onClick={() => ask(input)}>
              问
            </button>
          )}
        </div>
        <p className="fineprint">
          本站纯属虚构，如有雷同实属巧合 · 不构成任何投资建议 · 对话直接发往你本地的 CLI，不经过本站服务器 ·{' '}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
            GitHub 开源
          </a>
        </p>
      </footer>
    </div>
  );
}
