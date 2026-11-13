import { useState } from 'react';
import { Composer, MessageList, useChat } from '@/features/chat';
import { ModelPicker, useModels } from '@/features/models';
import type { BackendKey } from '@/shared/config/backends';

// 页面组装: 各功能之间互不引用,由这里把它们组合起来
export default function App() {
  const [backend, setBackend] = useState<BackendKey>('openrouter');
  const { models, model, setModel, error: modelsError } = useModels(backend);
  const { messages, isStreaming, canRegenerate, send, regenerate, stop, reset } = useChat(backend, model);

  return (
    <div className="app">
      <header className="header">
        <h1>AI Chat Demo</h1>
        <div className="selectors">
          <ModelPicker
            backend={backend}
            onBackendChange={setBackend}
            models={models}
            model={model}
            onModelChange={setModel}
            disabled={isStreaming}
          />
          <button onClick={reset} disabled={messages.length === 0}>新对话</button>
        </div>
      </header>
      {modelsError && <div className="notice">无法获取模型列表: {modelsError}</div>}
      <MessageList
        messages={messages}
        isStreaming={isStreaming}
        canRegenerate={canRegenerate}
        onRegenerate={regenerate}
      />
      <Composer isStreaming={isStreaming} canSend={model !== ''} onSend={send} onStop={stop} />
    </div>
  );
}
