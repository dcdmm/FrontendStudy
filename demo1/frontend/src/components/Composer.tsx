import { useState } from 'react';

type Props = {
  isStreaming: boolean;
  canSend: boolean; // 是否已选好模型
  onSend: (text: string) => void;
  onStop: () => void;
};

// 输入框的内容只有这个组件用,所以状态放在组件内部
export function Composer({ isStreaming, canSend, onSend, onStop }: Props) {
  const [input, setInput] = useState('');
  const ready = canSend && input.trim() !== '';

  function submit() {
    if (!ready || isStreaming) return;
    onSend(input);
    setInput('');
  }

  return (
    <footer className="composer">
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
      {isStreaming ? (
        <button onClick={onStop}>停止</button>
      ) : (
        <button onClick={submit} disabled={!ready}>发送</button>
      )}
    </footer>
  );
}
