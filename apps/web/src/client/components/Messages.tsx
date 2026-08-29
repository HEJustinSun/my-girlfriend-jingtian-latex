import { Fragment, useEffect, useRef, useState } from 'react';
import type { UIMessage } from 'ai';

function partsText(m: UIMessage, type: 'text' | 'reasoning'): string {
  return m.parts
    .filter((p) => p.type === type)
    .map((p) => ('text' in p ? p.text : ''))
    .join('');
}

function SunMessage({ m, streaming }: { m: UIMessage; streaming: boolean }) {
  const [showThinking, setShowThinking] = useState(false);
  const reasoning = partsText(m, 'reasoning');
  const text = partsText(m, 'text');
  return (
    <div className="msg msg-sun">
      <span className="msg-label">孙哥说</span>
      {reasoning && (
        <div className="thinking">
          <button className="thinking-toggle" onClick={() => setShowThinking(!showThinking)}>
            {showThinking ? '收起孙哥的内心戏' : '孙哥的内心戏'}
          </button>
          {showThinking && <p className="thinking-text">{reasoning}</p>}
        </div>
      )}
      <div className="msg-body">
        {text.split(/\n{2,}/).map((para, i) => (
          <p key={i}>
            {para}
            {streaming && i === text.split(/\n{2,}/).length - 1 && <span className="caret">▍</span>}
          </p>
        ))}
        {!text && streaming && <p><span className="caret">▍</span></p>}
      </div>
    </div>
  );
}

export function Messages({
  messages,
  busy,
  loadingLine,
}: {
  messages: UIMessage[];
  busy: boolean;
  loadingLine: string;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const last = messages[messages.length - 1];
  const waiting = busy && (!last || last.role === 'user' || !partsText(last, 'text'));
  const lastLen = last ? partsText(last, 'text').length : 0;

  // 用户主动向上滚动回看时停止吸底，回到接近底部时恢复
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      stickRef.current = window.innerHeight + window.scrollY >= el.scrollHeight - 120;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (stickRef.current) endRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [messages.length, lastLen, busy]);

  if (messages.length === 0) return null;

  return (
    <main className="chat">
      {messages.map((m, i) => (
        <Fragment key={m.id}>
          {i > 0 && <div className="nbreak nbreak-row">- - -</div>}
          {m.role === 'user' ? (
            <div className="msg msg-user">
              <span className="msg-label">你问</span>
              <p>{partsText(m, 'text')}</p>
            </div>
          ) : (
            <SunMessage m={m} streaming={busy && i === messages.length - 1} />
          )}
        </Fragment>
      ))}
      {waiting && <p className="waiting">{loadingLine}</p>}
      <div ref={endRef} />
    </main>
  );
}
