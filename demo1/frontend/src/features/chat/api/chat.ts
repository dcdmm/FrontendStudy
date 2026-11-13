import type { BackendKey } from '@/shared/config/backends';
import type { ChatMessage } from '../types';
import { request } from '@/shared/api/http';
import { readSse } from '@/shared/api/sse';

type StreamChatOptions = {
  backend: BackendKey;
  model: string;
  messages: ChatMessage[];
  signal?: AbortSignal;
};

// 流式聊天: 每收到一段文字就产出(yield)一次,调用方用 for await 逐段读取
export async function* streamChat({ backend, model, messages, signal }: StreamChatOptions): AsyncGenerator<string> {
  const res = await request(backend, '/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model }),
    signal,
  });
  if (!res.body) throw new Error('响应没有内容');

  for await (const { event, data } of readSse(res.body)) {
    if (event === 'delta') {
      yield (JSON.parse(data) as { text: string }).text;
    } else if (event === 'error') {
      throw new Error((JSON.parse(data) as { message: string }).message);
    }
  }
}
