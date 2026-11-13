import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { streamSSE } from 'hono/streaming';
import { zValidator } from '@hono/zod-validator';
import type { ModelsConfig } from '../config/models.js';
import { chatRequestSchema } from '../schemas/chat.js';
import type { LlmService } from '../services/llm.js';

export function chatRoute(models: ModelsConfig, llm: LlmService) {
  return new Hono().post(
    '/',
    // 校验请求体,不合格直接返回400
    zValidator('json', chatRequestSchema, (result) => {
      if (!result.success) {
        const issue = result.error.issues[0];
        throw new HTTPException(400, { message: `invalid ${issue.path.join('.')}: ${issue.message}` });
      }
    }),
    (c) => {
      const { messages, model = models.default } = c.req.valid('json');
      if (!models.models.includes(model)) {
        throw new HTTPException(400, { message: `model ${model} not in allow-list` });
      }

      return streamSSE(c, async (stream) => {
        // 前端点"停止"断开连接时,同时取消对模型的请求(不再消耗token)
        const controller = new AbortController();
        stream.onAbort(() => controller.abort());

        try {
          for await (const text of llm.streamText(model, messages, controller.signal)) {
            await stream.writeSSE({ event: 'delta', data: JSON.stringify({ text }) });
          }
        } catch (err) {
          if (stream.aborted) return; // 前端主动断开,不算错误
          // 流已经开始,状态码已经发出去了,只能通过 error 事件告诉前端
          console.error(err);
          const message = err instanceof Error ? err.message : String(err);
          await stream.writeSSE({ event: 'error', data: JSON.stringify({ message }) });
        }
      });
    },
  );
}
