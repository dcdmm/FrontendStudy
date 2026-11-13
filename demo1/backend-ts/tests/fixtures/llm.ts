import type { ChatMessage } from '../../src/schemas/chat.js';
import type { LlmService } from '../../src/services/llm.js';

// 假的模型服务: 按顺序产出给定的文字(遇到Error就抛出),并记录每次调用收到的参数
export function fakeLlm(script: (string | Error)[] = ['你好', '世界']) {
  const calls: { model: string; messages: ChatMessage[] }[] = [];

  const llm: LlmService = {
    async *streamText(model, messages) {
      calls.push({ model, messages });
      for (const item of script) {
        if (item instanceof Error) throw item;
        yield item;
      }
    },
  };

  return { llm, calls };
}
