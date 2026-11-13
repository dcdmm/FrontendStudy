import { z } from 'zod';

// 环境变量的格式要求,缺少或格式不对时启动就报错(而不是等到请求时才出错)
const envSchema = z.object({
  OPENROUTER_API_KEY: z.string().min(1),
  OPENROUTER_BASE_URL: z.url().default('https://openrouter.ai/api/v1'),
  OPENROUTER_PORT: z.coerce.number().int().positive().default(8787),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(`环境变量配置错误:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
