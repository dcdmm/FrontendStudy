import type { ModelsConfig } from '../../src/config/models.js';

// 测试用的模型白名单(不读真实的 models.json,改了配置也不影响测试)
export const testModels: ModelsConfig = {
  default: 'model-a',
  models: ['model-a', 'model-b'],
};
