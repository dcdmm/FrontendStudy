import { BACKENDS, type BackendKey } from '../config/backends';

// 带状态码的错误,调用方可以根据 status 做不同处理
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// 公共请求函数: 拼接后端地址,把各种失败统一转成用户能看懂的错误
export async function request(backend: BackendKey, path: string, init?: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${BACKENDS[backend].baseUrl}${path}`, init);
  } catch (err) {
    if (init?.signal?.aborted) throw err; // 主动取消的请求,原样抛出
    // 网络不通时浏览器只会报"Failed to fetch",换成看得懂的提示;cause保留原始错误,方便排查
    throw new Error('无法连接后端,请确认后端已启动', { cause: err });
  }

  if (!res.ok) {
    const message = describeHttpError(res.status, await readErrorMessage(res), res.headers.get('Retry-After'));
    throw new ApiError(res.status, message);
  }
  return res;
}

// 把HTTP错误状态码转成提示文字
export function describeHttpError(status: number, serverMessage: string, retryAfter: string | null): string {
  if (status === 429) return retryAfter ? `请求太频繁,请 ${retryAfter} 秒后再试` : '请求太频繁,请稍后再试';
  if (status >= 500) return `服务器出错了,请稍后再试(${status})`;
  return serverMessage ? `请求失败(${status}): ${serverMessage}` : `请求失败(${status})`;
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
