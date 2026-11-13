import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { LIMITS } from './config/limits.js';
import type { ModelsConfig } from './config/models.js';
import type { LlmService } from './services/llm.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { rateLimit } from './middleware/rate-limit.js';
import { healthRoute } from './routes/health.js';
import { modelsRoute } from './routes/models.js';
import { chatRoute } from './routes/chat.js';

export type AppDeps = {
  models: ModelsConfig;
  llm: LlmService;
};

// 组装app: 依赖从外部传入(测试时可以传入假的llm,不用真的调用模型)
export function createApp({ models, llm }: AppDeps) {
  const app = new Hono();

  app.use(logger()); // 打印每个请求的方法、路径、状态码、耗时
  app.use(cors({ exposeHeaders: ['Retry-After'] })); // 跨域时前端默认读不到Retry-After,要显式允许
  app.use('/chat', rateLimit(LIMITS.chatRateLimit)); // 聊天会消耗token,单独限流

  app.route('/health', healthRoute());
  app.route('/models', modelsRoute(models));
  app.route('/chat', chatRoute(models, llm));

  app.notFound(notFoundHandler);
  app.onError(errorHandler);

  return app;
}
