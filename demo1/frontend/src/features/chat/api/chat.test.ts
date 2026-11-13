import { http } from 'msw';
import { describe, expect, it } from 'vitest';
import { API, deltas, sseResponse } from '@/test/mocks/handlers';
import { server } from '@/test/mocks/server';
import { streamChat } from './chat';

// 把流式结果收集成数组
async function collect(model = 'model-a') {
  const texts: string[] = [];
  for await (const text of streamChat({ backend: 'openrouter', model, messages: [{ role: 'user', content: 'hi' }] })) {
    texts.push(text);
  }
  return texts;
}

describe('streamChat', () => {
  it('逐段产出模型的文字', async () => {
    expect(await collect()).toEqual(['从前有座山', ',山里有座庙']);
  });

  it('把模型和消息发给后端', async () => {
    let body: unknown;
    server.use(
      http.post(`${API}/chat`, async ({ request }) => {
        body = await request.json();
        return sseResponse(deltas('ok'));
      }),
    );
    await collect('model-b');
    expect(body).toEqual({ model: 'model-b', messages: [{ role: 'user', content: 'hi' }] });
  });

  it('收到error事件时抛出错误', async () => {
    server.use(
      http.post(`${API}/chat`, () =>
        sseResponse([...deltas('半句'), { event: 'error', data: { message: 'upstream 401' } }]),
      ),
    );
    await expect(collect()).rejects.toThrow('upstream 401');
  });
});
