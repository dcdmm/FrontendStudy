import { useEffect, useRef } from 'react';
import type { UiMessage } from '../types';
import { MessageItem } from './MessageItem';

type Props = {
  messages: UiMessage[];
  isStreaming: boolean;
  canRegenerate: boolean;
  onRegenerate: () => void;
};

export function MessageList({ messages, isStreaming, canRegenerate, onRegenerate }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // 有新内容时自动滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  return (
    <main className="messages">
      {messages.length === 0 && <p className="empty">开始对话吧～</p>}
      {messages.map((m, i) => (
        <MessageItem key={m.id} message={m} pending={isStreaming && i === messages.length - 1} />
      ))}
      {canRegenerate && <button className="regenerate" onClick={onRegenerate}>重新生成</button>}
      <div ref={bottomRef} />
    </main>
  );
}
