import { useReducer, useRef } from 'react';
import { streamChat } from '../api/chat';
import { canRegenerate, chatReducer, createMessage, initialChatState, toHistory } from '../state/chatReducer';
import type { ChatMessage } from '../types';
import type { BackendKey } from '@/shared/config/backends';
import { getErrorMessage } from '@/shared/utils/error';

// 连接状态(reducer)和网络请求(streamChat),组件只负责显示
export function useChat(backend: BackendKey, model: string) {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const abortRef = useRef<AbortController | null>(null);
  const isStreaming = state.streamingId !== null;

  // 请求模型,把回复逐段写进 replyId 这条消息
  async function streamReply(history: ChatMessage[], replyId: string) {
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      for await (const text of streamChat({ backend, model, messages: history, signal: controller.signal })) {
        dispatch({ type: 'delta', id: replyId, text });
      }
    } catch (err) {
      // 用户主动停止不算错误,保留已经生成的内容
      if (!controller.signal.aborted) dispatch({ type: 'fail', id: replyId, error: getErrorMessage(err) });
    } finally {
      dispatch({ type: 'done', id: replyId });
    }
  }

  function send(text: string) {
    const content = text.trim();
    if (!content || isStreaming || !model) return;
    const user = createMessage('user', content);
    const reply = createMessage('assistant');
    dispatch({ type: 'send', user, reply });
    void streamReply(toHistory([...state.messages, user]), reply.id);
  }

  // 重新生成最后一条回复(不满意或出错时用)
  function regenerate() {
    if (!canRegenerate(state) || !model) return;
    const reply = createMessage('assistant');
    dispatch({ type: 'regenerate', reply });
    void streamReply(toHistory(state.messages.slice(0, -1)), reply.id);
  }

  function stop() {
    abortRef.current?.abort();
  }

  function reset() {
    stop();
    dispatch({ type: 'reset' });
  }

  return {
    messages: state.messages,
    isStreaming,
    canRegenerate: canRegenerate(state),
    send,
    regenerate,
    stop,
    reset,
  };
}
