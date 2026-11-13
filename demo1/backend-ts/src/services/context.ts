import type { ChatMessage } from '../schemas/chat.js';

/**
 * 裁剪上下文: 模型一次能接收的内容有限,对话太长时丢掉最早的消息
 * 1. system消息全部保留(放在最前面)
 * 2. 其余消息从最新往前保留,总字符数超过maxChars就停止
 * 3. 最后一条消息(用户刚发的)无论多长都保留
 * 4. 裁剪后开头如果是AI回复,也去掉(上下文要从用户的提问开始)
 */
export function trimHistory(messages: ChatMessage[], maxChars: number): ChatMessage[] {
  const system = messages.filter((m) => m.role === 'system');
  const rest = messages.filter((m) => m.role !== 'system');

  let used = system.reduce((sum, m) => sum + m.content.length, 0);
  const kept: ChatMessage[] = [];

  for (let i = rest.length - 1; i >= 0; i--) {
    const isLast = i === rest.length - 1;
    if (!isLast && used + rest[i].content.length > maxChars) break;
    kept.unshift(rest[i]);
    used += rest[i].content.length;
  }

  while (kept.length > 1 && kept[0].role === 'assistant') kept.shift();

  return [...system, ...kept];
}
