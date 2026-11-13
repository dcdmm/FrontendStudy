import { describe, expect, it } from 'vitest';
import { fakeLlm } from '../../tests/fixtures/llm.js';
import { assistant, user } from '../../tests/fixtures/messages.js';
import { testModels } from '../../tests/fixtures/models.js';
import { createApp } from '../app.js';
import type { ChatMessage } from '../schemas/chat.js';

// 每个测试新建一个app,限流计数这类状态不会互相影响
function setup(script?: (string | Error)[]) {
  const { llm, calls } = fakeLlm(script);
  const app = createApp({ models: testModels, llm });
  const chat = (body: { messages: ChatMessage[]; model?: string }) =>
    app.request('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  return { chat, calls };
}

describe('POST /chat', () => {
  it('把模型输出按SSE格式逐段返回', async () => {
    const { chat } = setup(['你好', '世界']);
    const res = await chat({ messages: [user('hi')] });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/event-stream');
    expect(await res.text()).toBe(
      'event: delta\ndata: {"text":"你好"}\n\n' +
      'event: delta\ndata: {"text":"世界"}\n\n',
    );
  });

  it('不传模型时使用默认模型', async () => {
    const { chat, calls } = setup();
    await (await chat({ messages: [user('hi')] })).text();
    expect(calls[0].model).toBe('model-a');
  });

  it('模型中途出错时,保留已输出的内容,再发送error事件', async () => {
    const { chat } = setup(['半句', new Error('upstream 401')]);
    const text = await (await chat({ messages: [user('hi')] })).text();

    expect(text).toContain('data: {"text":"半句"}');
    expect(text).toContain('event: error\ndata: {"message":"upstream 401"}');
  });

  it('对话太长时,发给模型的是裁剪后的上下文', async () => {
    const { chat, calls } = setup();
    const long = 'x'.repeat(4000);
    // 总共 4000×3+2 = 12002 字,超过上限12000
    await (await chat({ messages: [user(long), assistant(long), user(long), assistant('a'), user('b')] })).text();

    expect(calls[0].messages).toEqual([user(long), assistant('a'), user('b')]);
  });

  // it.each: 同一套断言跑多组数据
  it.each([
    ['模型不在白名单', { messages: [user('hi')], model: 'model-x' }, 'model model-x not in allow-list'],
    ['最后一条不是用户消息', { messages: [user('hi'), assistant('yo')] }, 'last message must be from user'],
    ['消息超过4000字', { messages: [user('x'.repeat(4001))] }, 'messages.0.content'],
    ['消息内容为空', { messages: [user('')] }, 'messages.0.content'],
    ['没有任何消息', { messages: [] }, 'invalid messages'],
  ])('请求不合法时返回400: %s', async (_name, body, expected) => {
    const { chat, calls } = setup();
    const res = await chat(body);

    expect(res.status).toBe(400);
    expect((await res.json()).error.message).toContain(expected);
    expect(calls).toHaveLength(0); // 不合法的请求不会调用模型
  });

  it('同一客户端1分钟内超过20次请求时返回429', async () => {
    const { chat } = setup();
    for (let i = 0; i < 20; i++) {
      const res = await chat({ messages: [user('hi')] });
      expect(res.status).toBe(200);
      await res.text();
    }

    const res = await chat({ messages: [user('hi')] });
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBeTruthy();
  });
});
