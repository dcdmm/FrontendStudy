import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createLlmService } from '../../src/services/llm.js';

// 集成测试: 用真实的OpenAI SDK,连接本地的假模型服务器
// SDK升级后如果收发格式变了,这里会发现;又不用花钱调用真实模型
let server: Server;
let baseURL: string;
let received: { url?: string; auth?: string; body?: unknown };

// 按 OpenAI Responses API 的流式格式输出一个事件
const sseEvent = (data: { type: string } & Record<string, unknown>) =>
  `event: ${data.type}\ndata: ${JSON.stringify(data)}\n\n`;

beforeAll(async () => {
  server = createServer(async (req, res) => {
    let body = '';
    for await (const chunk of req) body += chunk;
    received = { url: req.url, auth: req.headers.authorization, body: JSON.parse(body) };

    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    res.write(sseEvent({ type: 'response.output_text.delta', delta: '你好' }));
    res.write(sseEvent({ type: 'response.output_text.delta', delta: '世界' }));
    res.write(sseEvent({ type: 'response.completed' })); // 其他类型的事件应该被忽略
    res.end();
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  baseURL = `http://localhost:${(server.address() as AddressInfo).port}/v1`;
});

afterAll(() => {
  server.close();
});

describe('createLlmService(真实OpenAI SDK)', () => {
  const llm = () => createLlmService({ apiKey: 'test-key', baseURL });

  it('把模型的流式输出转换成逐段的文字', async () => {
    const texts: string[] = [];
    for await (const text of llm().streamText('model-a', [{ role: 'user', content: 'hi' }])) {
      texts.push(text);
    }
    expect(texts).toEqual(['你好', '世界']);
  });

  it('请求发到 /responses,带上API key、模型和消息', async () => {
    for await (const _ of llm().streamText('model-a', [{ role: 'user', content: 'hi' }])) {
      // 只需要把流读完
    }
    expect(received.url).toBe('/v1/responses');
    expect(received.auth).toBe('Bearer test-key');
    expect(received.body).toMatchObject({
      model: 'model-a',
      input: [{ role: 'user', content: 'hi' }],
      stream: true,
    });
  });
});
