import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { API } from '@/test/mocks/handlers';
import { server } from '@/test/mocks/server';
import { ApiError, describeHttpError, request } from './http';

describe('describeHttpError', () => {
  it.each([
    [429, '30', '请求太频繁,请 30 秒后再试'],
    [429, null, '请求太频繁,请稍后再试'],
    [502, null, '服务器出错了,请稍后再试(502)'],
  ])('状态码 %i, Retry-After=%s → %s', (status, retryAfter, expected) => {
    expect(describeHttpError(status, '', retryAfter)).toBe(expected);
  });

  it('其他错误显示后端返回的信息', () => {
    expect(describeHttpError(400, 'bad model', null)).toBe('请求失败(400): bad model');
  });
});

describe('request', () => {
  it('成功时返回响应', async () => {
    const res = await request('openrouter', '/models');
    expect(await res.json()).toMatchObject({ default: 'model-a' });
  });

  it('连不上后端时,提示确认后端已启动', async () => {
    server.use(http.get(`${API}/models`, () => HttpResponse.error())); // 模拟网络错误
    await expect(request('openrouter', '/models')).rejects.toThrow('无法连接后端,请确认后端已启动');
  });

  it('429时读取Retry-After,告诉用户要等几秒', async () => {
    server.use(
      http.get(`${API}/models`, () =>
        HttpResponse.json({ error: { message: 'too many' } }, { status: 429, headers: { 'Retry-After': '30' } }),
      ),
    );
    const err = await request('openrouter', '/models').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 429, message: '请求太频繁,请 30 秒后再试' });
  });

  it('能读取FastAPI格式的错误信息({detail})', async () => {
    server.use(http.get(`${API}/models`, () => HttpResponse.json({ detail: 'model not found' }, { status: 400 })));
    await expect(request('openrouter', '/models')).rejects.toThrow('请求失败(400): model not found');
  });

  it('主动取消的请求原样抛出,不当成"连不上后端"', async () => {
    const controller = new AbortController();
    controller.abort();
    const err = await request('openrouter', '/models', { signal: controller.signal }).catch((e: unknown) => e);
    expect(err).toMatchObject({ name: 'AbortError' });
  });
});
