import type { ErrorHandler, NotFoundHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

// 统一错误格式: { error: { message } }
export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: { message: err.message } }, err.status);
  }
  console.error(err); // 未预料的错误: 打印详情,但不把内部信息返回给前端
  return c.json({ error: { message: 'Internal Server Error' } }, 500);
};

export const notFoundHandler: NotFoundHandler = (c) =>
  c.json({ error: { message: `Not Found: ${c.req.method} ${c.req.path}` } }, 404);
