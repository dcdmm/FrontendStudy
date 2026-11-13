import { http, HttpResponse } from 'msw';
import { BACKENDS } from '@/shared/config/backends';

export const API = BACKENDS.openrouter.baseUrl;

type SseEvent = { event: string; data: unknown };

// 构造SSE流式响应(格式和真实后端一致)
export function sseResponse(events: SseEvent[]) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const { event, data } of events) {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      }
      controller.close();
    },
  });
  return new HttpResponse(stream, { headers: { 'Content-Type': 'text/event-stream' } });
}

// 把几段文字转成一串delta事件
export const deltas = (...texts: string[]): SseEvent[] => texts.map((text) => ({ event: 'delta', data: { text } }));

// 默认的假接口;单个测试可以用 server.use(...) 临时覆盖
export const handlers = [
  http.get(`${API}/models`, () => HttpResponse.json({ models: ['model-a', 'model-b'], default: 'model-a' })),
  http.post(`${API}/chat`, () => sseResponse(deltas('从前有座山', ',山里有座庙'))),
];
