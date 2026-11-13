import { BACKENDS, type BackendKey } from '../config/backends';

// 公共请求函数: 拼接后端地址,状态码不是2xx时统一抛出错误
export async function request(backend: BackendKey, path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${BACKENDS[backend].baseUrl}${path}`, init);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await readErrorMessage(res)}`);
  }
  return res;
}

// 两个后端的错误格式不同: backend-ts是{error:{message}},FastAPI是{detail}
async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const body = JSON.parse(text);
    const message = body?.error?.message ?? body?.detail;
    return typeof message === 'string' ? message : text;
  } catch {
    return text;
  }
}
