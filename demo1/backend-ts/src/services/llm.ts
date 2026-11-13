import OpenAI from 'openai';
import type { ChatMessage } from '../schemas/chat.js';

// 业务层: 封装对模型的调用,路由不直接接触OpenAI SDK(换模型厂商或写测试时只改这里)
export type LlmService = {
  // 逐段产出模型生成的文字
  streamText(model: string, messages: ChatMessage[], signal?: AbortSignal): AsyncIterable<string>;
};

export function createLlmService(options: { apiKey: string; baseURL: string }): LlmService {
  const client = new OpenAI(options);

  return {
    async *streamText(model, messages, signal) {
      const stream = await client.responses.create(
        { model, input: messages, stream: true },
        { signal },
      );
      for await (const event of stream) {
        if (event.type === 'response.output_text.delta' && event.delta) {
          yield event.delta;
        }
      }
    },
  };
}
