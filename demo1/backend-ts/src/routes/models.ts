import { Hono } from 'hono';
import type { ModelsConfig } from '../config/models.js';

export function modelsRoute(models: ModelsConfig) {
  return new Hono().get('/', (c) => c.json({ models: models.models, default: models.default }));
}
