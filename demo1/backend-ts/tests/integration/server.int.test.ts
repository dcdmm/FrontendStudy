import type { AddressInfo } from 'node:net';
import { serve, type ServerType } from '@hono/node-server';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/app.js';
import type { LlmService } from '../../src/services/llm.js';
import { testModels } from '../fixtures/models.js';

// 集成测试: 真正启动HTTP服务器,通过网络发请求(单元测试里的 app.request 不经过网络)
let server: ServerType;
let baseUrl: string;
let llmSignal: AbortSignal | undefined;

// 假模型: 先输出一段,然后一直等到请求被取消(模拟模型还在慢慢生成)
const slowLlm: LlmService = {
  async *streamText(_model, _messages, signal) {
    llmSignal = signal;
    yield '第一段';
    await new Promise((resolve) => signal?.addEventListener('abort', resolve));
  },
};

beforeAll(async () => {
  const app = createApp({ models: testModels, llm: slowLlm });
  // port: 0 让系统分配空闲端口,不会和正在运行的服务冲突
  server = await new Promise<ServerType>((resolve) => {
    const s = serve({ fetch: app.fetch, port: 0 }, () => resolve(s));
  });
  baseUrl = `http://localhost:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
  server.close();
});

describe('真实HTTP服务器', () => {
  it('GET /health', async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  it('客户端断开连接时,后端会取消对模型的请求', async () => {
    const controller = new AbortController();
    const res = await fetch(`${baseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
      signal: controller.signal,
    });

    // 先读到第一段,确认流已经开始
    const { value } = await res.body!.getReader().read();
    expect(new TextDecoder().decode(value)).toContain('第一段');
    expect(llmSignal?.aborted).toBe(false);

    // 模拟用户点"停止": 断开连接
    controller.abort();

    // 后端察觉到断开需要一点时间,用 waitFor 反复检查直到成立
    await vi.waitFor(() => expect(llmSignal?.aborted).toBe(true));
  });
});
