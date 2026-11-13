import { describe, expect, it } from 'vitest';
import { parseSse, readSse, type SseEvent } from './sse';

describe('parseSse', () => {
  it('解析完整的事件', () => {
    expect(parseSse('event: delta\ndata: {"text":"hi"}\n\n')).toEqual({
      events: [{ event: 'delta', data: '{"text":"hi"}' }],
      rest: '',
    });
  });

  it('不完整的部分留在rest里,等下一块数据到达再拼', () => {
    const { events, rest } = parseSse('event: delta\ndata: 1\n\nevent: delta\nda');
    expect(events).toEqual([{ event: 'delta', data: '1' }]);
    expect(rest).toBe('event: delta\nda');
  });
});

describe('readSse', () => {
  // 把字节分成几块依次送出,模拟网络分批到达
  function streamOf(chunks: Uint8Array[]) {
    return new ReadableStream<Uint8Array>({
      start(controller) {
        chunks.forEach((chunk) => controller.enqueue(chunk));
        controller.close();
      },
    });
  }

  async function readAll(stream: ReadableStream<Uint8Array>) {
    const events: SseEvent[] = [];
    for await (const event of readSse(stream)) events.push(event);
    return events;
  }

  it('一个事件被拆成两块到达,也能正确拼接', async () => {
    const encoder = new TextEncoder();
    const events = await readAll(streamOf([encoder.encode('event: delta\nda'), encoder.encode('ta: hi\n\n')]));
    expect(events).toEqual([{ event: 'delta', data: 'hi' }]);
  });

  it('一个汉字的字节被拆到两块里,也能正确解码', async () => {
    const bytes = new TextEncoder().encode('event: delta\ndata: 你好\n\n');
    // "你"的UTF-8编码是3个字节(E4 BD A0),从中间切开
    const cut = bytes.indexOf(0xe4) + 1;
    const events = await readAll(streamOf([bytes.slice(0, cut), bytes.slice(cut)]));
    expect(events).toEqual([{ event: 'delta', data: '你好' }]);
  });
});
