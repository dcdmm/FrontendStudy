import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { loadEnv } from './config/env.js';
import { loadModels } from './config/models.js';
import { createLlmService } from './services/llm.js';

// 入口: 读取配置 → 创建依赖 → 组装app → 启动服务器
const env = loadEnv();

const app = createApp({
  models: loadModels(),
  llm: createLlmService({ apiKey: env.OPENROUTER_API_KEY, baseURL: env.OPENROUTER_BASE_URL }),
});

serve({ fetch: app.fetch, port: env.OPENROUTER_PORT }, (info) => {
  console.log(`[backend-ts] listening on http://localhost:${info.port}`);
});
