import { useState } from 'react';
import { ChatHeader } from './components/ChatHeader';
import { Composer } from './components/Composer';
import { MessageList } from './components/MessageList';
import type { BackendKey } from './config/backends';
import { useChat } from './hooks/useChat';
import { useModels } from './hooks/useModels';

// 页面组装: 状态逻辑在hooks里,显示在components里,这里只负责把它们连起来
export default function App() {
  const [backend, setBackend] = useState<BackendKey>('openrouter');
  const { models, model, setModel, error: modelsError } = useModels(backend);
  const { messages, isStreaming, send, stop, reset } = useChat(backend, model);

  return (
    <div className="app">
      <ChatHeader
        backend={backend}
        onBackendChange={setBackend}
        models={models}
        model={model}
        onModelChange={setModel}
        disabled={isStreaming}
        canReset={messages.length > 0}
        onReset={reset}
      />
      {modelsError && <div className="notice">无法获取模型列表({modelsError}),请确认后端已启动</div>}
      <MessageList messages={messages} isStreaming={isStreaming} />
      <Composer isStreaming={isStreaming} canSend={model !== ''} onSend={send} onStop={stop} />
    </div>
  );
}
