import { readFileSync } from 'node:fs';
import { z } from 'zod';

// models.json 里 openrouter 部分的格式要求
const modelsSchema = z
  .object({
    default: z.string(),
    models: z.array(z.string()).min(1),
  })
  .refine((cfg) => cfg.models.includes(cfg.default), {
    message: 'default 必须在 models 列表里',
  });

export type ModelsConfig = z.infer<typeof modelsSchema>;

export function loadModels(): ModelsConfig {
  // 相对当前文件定位到 demo1/models.json(src和dist下层级相同,都能找到)
  const file = new URL('../../../models.json', import.meta.url);
  const json = JSON.parse(readFileSync(file, 'utf-8'));
  return modelsSchema.parse(json.openrouter);
}
