import type { BackendKey } from '@/shared/config/backends';
import { request } from '@/shared/api/http';

export type ModelsResponse = { models: string[]; default: string };

export async function fetchModels(backend: BackendKey, signal?: AbortSignal): Promise<ModelsResponse> {
  const res = await request(backend, '/models', { signal });
  return res.json();
}
