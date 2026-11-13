import type { UiMessage } from '../types';

type Props = {
  message: UiMessage;
  pending: boolean; // 正在等待这条消息的回复
};

export function MessageItem({ message, pending }: Props) {
  let text = message.content;
  if (!text && pending) text = '...';
  else if (!text && !message.error) text = '(已停止)';

  return (
    <div className={`msg msg-${message.role}`}>
      <div className="role">{message.role === 'user' ? '我' : 'AI'}</div>
      {text && <div className="content">{text}</div>}
      {message.error && <div className="content error">出错了: {message.error}</div>}
    </div>
  );
}
