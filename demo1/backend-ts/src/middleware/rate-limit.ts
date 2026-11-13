import type { Context, MiddlewareHandler } from 'hono';
import { getConnInfo } from '@hono/node-server/conninfo';

export type RateLimitOptions = {
  windowMs: number; // 时间窗口(毫秒)
  max: number; // 窗口内最多允许的请求次数
  keyOf?: (c: Context) => string; // 怎么区分客户端,默认按IP
  now?: () => number; // 获取当前时间,测试时可以传入假时间
};

// 默认按客户端IP区分;拿不到IP时(比如测试里直接调用app.request)统一算作unknown
function clientIp(c: Context): string {
  try {
    return getConnInfo(c).remote.address ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * 限流(滑动窗口): 同一客户端在任意 windowMs 时间内最多请求 max 次,超出返回429
 * 计数存在内存里: 服务重启会清空;部署多台服务器时要换成Redis这类共享存储
 */
export function rateLimit({ windowMs, max, keyOf = clientIp, now = Date.now }: RateLimitOptions): MiddlewareHandler {
  const hits = new Map<string, number[]>(); // 客户端 → 窗口内每次请求的时间

  return async (c, next) => {
    const key = keyOf(c);
    const t = now();
    const recent = (hits.get(key) ?? []).filter((time) => t - time < windowMs);

    if (recent.length >= max) {
      hits.set(key, recent);
      // 等窗口内最早的那次请求过期,就能再发了
      const retryAfter = Math.ceil((recent[0] + windowMs - t) / 1000);
      return c.json(
        { error: { message: `too many requests, retry after ${retryAfter}s` } },
        429,
        { 'Retry-After': String(retryAfter) },
      );
    }

    recent.push(t);
    hits.set(key, recent);
    await next();
  };
}
