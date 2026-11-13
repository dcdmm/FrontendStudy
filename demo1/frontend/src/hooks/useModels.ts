import { useEffect, useState } from 'react';
import { fetchModels } from '../api/models';
import type { BackendKey } from '../config/backends';
import { getErrorMessage } from '../utils/error';

// 切换后端时重新加载模型列表,并选中默认模型
export function useModels(backend: BackendKey) {
  const [models, setModels] = useState<string[]>([]);
  const [model, setModel] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setModels([]);
    setModel('');
    setError(null);

    fetchModels(backend, controller.signal)
      .then((res) => {
        setModels(res.models);
        setModel(res.default);
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(getErrorMessage(err));
      });

    // 切换到别的后端时,取消还没完成的请求(避免旧结果覆盖新结果)
    return () => controller.abort();
  }, [backend]);

  return { models, model, setModel, error };
}
