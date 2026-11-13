import { useRef, useState } from 'react';
import { streamChat } from '../api/chat';
import type { BackendKey } from '../config/backends';
import type { ChatMessage, UiMessage } from '../types/chat';
import { getErrorMessage } from '../utils/error';

// 聊天的状态和操作都在这里,组件只负责显示
export function useChat(backend: BackendKey, model: string) {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // 按id更新一条消息(找不到就不变,比如已经点了"新对话")
  function updateMessage(id: string, update: (m: UiMessage) => UiMessage) {
    setMessages((prev) => prev.map((m) => (m.id === id ? update(m) : m)));
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || isStreaming || !model) return;

    const userMessage: UiMessage = { id: crypto.randomUUID(), role: 'user', content };
    const reply: UiMessage = { id: crypto.randomUUID(), role: 'assistant', content: '' };
    // 发给后端的历史记录: 去掉出错的和空的消息,只保留role和content
    const history: ChatMessage[] = [...messages, userMessage]
      .filter((m) => !m.error && m.content)
      .map(({ role, content }) => ({ role, content }));

    setMessages((prev) => [...prev, userMessage, reply]);
    setIsStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      for await (const delta of streamChat({ backend, model, messages: history, signal: controller.signal })) {
        updateMessage(reply.id, (m) => ({ ...m, content: m.content + delta }));
      }
    } catch (err) {
      // 用户主动停止不算错误,保留已经生成的内容
      if (!controller.signal.aborted) {
        updateMessage(reply.id, (m) => ({ ...m, error: getErrorMessage(err) }));
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setIsStreaming(false);
      }
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  function reset() {
    stop();
    setMessages([]);
  }

  return { messages, isStreaming, send, stop, reset };
}
