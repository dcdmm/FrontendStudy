import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { rateLimit } from './rate-limit.js';

// 搭一个最小的app只挂限流中间件;时间由测试控制(clock.now),客户端用请求头区分
function setup(max: number, windowMs = 10_000) {
  const clock = { now: 0 };
  const app = new Hono()
    .use(rateLimit({ windowMs, max, now: () => clock.now, keyOf: (c) => c.req.header('x-client') ?? 'default' }))
    .get('/', (c) => c.text('ok'));
  const hit = (client = 'default') => app.request('/', { headers: { 'x-client': client } });
  return { clock, hit };
}

describe('rateLimit', () => {
  it('超过限额返回429,并告诉客户端还要等几秒', async () => {
    const { clock, hit } = setup(2, 10_000);
    await hit(); // 第0秒
    clock.now = 3000;
    await hit(); // 第3秒
    clock.now = 4000;
    const res = await hit(); // 第4秒,第3次请求

    expect(res.status).toBe(429);
    // 最早那次(第0秒)在第10秒过期,所以还要等6秒
    expect(res.headers.get('Retry-After')).toBe('6');
  });

  it('时间窗口过去后恢复正常', async () => {
    const { clock, hit } = setup(1, 10_000);
    await hit();

    clock.now = 9_999;
    expect((await hit()).status).toBe(429);

    clock.now = 10_000;
    expect((await hit()).status).toBe(200);
  });

  it('不同客户端分别计数', async () => {
    const { hit } = setup(1);
    expect((await hit('A')).status).toBe(200);
    expect((await hit('A')).status).toBe(429);
    expect((await hit('B')).status).toBe(200);
  });
});
