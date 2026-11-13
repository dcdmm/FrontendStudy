import { describe, expect, it } from 'vitest';
import { fakeLlm } from '../tests/fixtures/llm.js';
import { testModels } from '../tests/fixtures/models.js';
import { createApp } from './app.js';

const app = createApp({ models: testModels, llm: fakeLlm().llm });

describe('app', () => {
  it('GET /health 返回ok', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });

  it('GET /models 返回模型列表和默认模型', async () => {
    const res = await app.request('/models');
    expect(await res.json()).toEqual({ models: ['model-a', 'model-b'], default: 'model-a' });
  });

  it('不存在的路径返回404,错误格式统一', async () => {
    const res = await app.request('/nope');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: { message: 'Not Found: GET /nope' } });
  });

  it('跨域请求允许前端读取Retry-After响应头', async () => {
    const res = await app.request('/health', { headers: { Origin: 'http://localhost:5173' } });
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(res.headers.get('Access-Control-Expose-Headers')).toBe('Retry-After');
  });
});
