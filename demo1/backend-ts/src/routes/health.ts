import { Hono } from 'hono';

// 健康检查: 部署平台或监控用它判断服务是否还活着
export function healthRoute() {
  return new Hono().get('/', (c) => c.json({ status: 'ok' }));
}
