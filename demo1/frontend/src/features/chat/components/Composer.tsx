import { useState } from 'react';
import { MAX_INPUT_CHARS } from '@/shared/config/limits';

type Props = {
  isStreaming: boolean;
  canSend: boolean; // 是否已选好模型
  onSend: (text: string) => void;
  onStop: () => void;
};

// 输入框的内容只有这个组件用,所以状态放在组件内部
export function Composer({ isStreaming, canSend, onSend, onStop }: Props) {
  const [input, setInput] = useState('');
  const length = input.trim().length; // 按实际发送的内容(去掉首尾空白)计算字数
  const tooLong = length > MAX_INPUT_CHARS;
  const ready = canSend && length > 0 && !tooLong;

  function submit() {
    if (!ready || isStreaming) return;
    onSend(input);
    setInput('');
  }

  return (
    <footer className="composer">
      <div className="composer-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            // isComposing: 中文输入法选词时按的Enter不算发送
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="输入消息，Enter 发送，Shift+Enter 换行"
          rows={2}
        />
        <span className={tooLong ? 'counter over' : 'counter'}>{length}/{MAX_INPUT_CHARS}</span>
      </div>
      {isStreaming ? (
        <button onClick={onStop}>停止</button>
      ) : (
        <button onClick={submit} disabled={!ready}>发送</button>
      )}
    </footer>
  );
}
