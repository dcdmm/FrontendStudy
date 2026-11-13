// SSE(服务器推送事件)格式: 每个事件由"event: 名称"和"data: 内容"两行组成,事件之间空一行
export type SseEvent = { event: string; data: string };

// 纯函数: 把缓冲区切成完整的事件,最后不完整的部分作为rest留到下一块数据到达再拼
export function parseSse(buffer: string): { events: SseEvent[]; rest: string } {
  const blocks = buffer.split('\n\n');
  const rest = blocks.pop() ?? '';
  const events: SseEvent[] = [];

  for (const block of blocks) {
    let event = 'message';
    const data: string[] = [];
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
    }
    if (data.length > 0) events.push({ event, data: data.join('\n') });
  }
  return { events, rest };
}

// 从响应体中逐个读出SSE事件(网络会把数据拆成任意大小的块,所以需要缓冲)
export async function* readSse(body: ReadableStream<Uint8Array>): AsyncGenerator<SseEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const { events, rest } = parseSse(buffer);
      buffer = rest;
      yield* events;
    }
  } finally {
    reader.releaseLock();
  }
}
