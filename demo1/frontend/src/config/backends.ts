// 可切换的后端(两个后端接口一致: GET /models, POST /chat)
export const BACKENDS = {
  openrouter: { label: 'OpenRouter(Hono)', baseUrl: 'http://localhost:8787' },
  dashscope: { label: '阿里DashScope(FastAPI)', baseUrl: 'http://localhost:8000' },
} as const;

export type BackendKey = keyof typeof BACKENDS;
