import { describe, expect, it } from 'vitest';
import type { UiMessage } from '../types';
import { canRegenerate, chatReducer, initialChatState, toHistory, type ChatState } from './chatReducer';

const msg = (id: string, role: UiMessage['role'], content = '', error?: string): UiMessage =>
  error ? { id, role, content, error } : { id, role, content };

// 一轮对话结束后的状态: 用户说hi,AI回复"你好"
const afterOneTurn: ChatState = {
  messages: [msg('u1', 'user', 'hi'), msg('r1', 'assistant', '你好')],
  streamingId: null,
};

describe('chatReducer', () => {
  it('send: 加入用户消息和一条空回复,进入生成中', () => {
    const state = chatReducer(initialChatState, {
      type: 'send',
      user: msg('u1', 'user', 'hi'),
      reply: msg('r1', 'assistant'),
    });
    expect(state).toEqual({ messages: [msg('u1', 'user', 'hi'), msg('r1', 'assistant')], streamingId: 'r1' });
  });

  it('delta: 把文字追加到对应的回复上', () => {
    let state: ChatState = { messages: [msg('r1', 'assistant')], streamingId: 'r1' };
    state = chatReducer(state, { type: 'delta', id: 'r1', text: '你' });
    state = chatReducer(state, { type: 'delta', id: 'r1', text: '好' });
    expect(state.messages[0].content).toBe('你好');
  });

  it('fail: 记录错误,已经生成的内容保留', () => {
    const state = chatReducer(afterOneTurn, { type: 'fail', id: 'r1', error: 'boom' });
    expect(state.messages[1]).toEqual(msg('r1', 'assistant', '你好', 'boom'));
  });

  it('done: 结束生成', () => {
    const state = chatReducer({ ...afterOneTurn, streamingId: 'r1' }, { type: 'done', id: 'r1' });
    expect(state.streamingId).toBeNull();
  });

  it('done: 旧请求的结束信号不影响新的生成(比如点了"新对话"之后)', () => {
    const state: ChatState = { messages: [], streamingId: 'r2' };
    expect(chatReducer(state, { type: 'done', id: 'r1' })).toBe(state); // 同一个对象,完全没变
  });

  it('regenerate: 最后一条回复换成新的空回复', () => {
    const state = chatReducer(afterOneTurn, { type: 'regenerate', reply: msg('r2', 'assistant') });
    expect(state).toEqual({ messages: [msg('u1', 'user', 'hi'), msg('r2', 'assistant')], streamingId: 'r2' });
  });

  it('不修改传入的状态,而是返回新对象', () => {
    const before = structuredClone(afterOneTurn);
    chatReducer(afterOneTurn, { type: 'delta', id: 'r1', text: '!' });
    expect(afterOneTurn).toEqual(before);
  });
});

describe('toHistory', () => {
  it('去掉出错的和空的消息,只保留role和content', () => {
    const messages = [
      msg('u1', 'user', 'hi'),
      msg('r1', 'assistant', '', 'boom'),
      msg('u2', 'user', 'again'),
      msg('r2', 'assistant'),
    ];
    expect(toHistory(messages)).toEqual([
      { role: 'user', content: 'hi' },
      { role: 'user', content: 'again' },
    ]);
  });
});

describe('canRegenerate', () => {
  it('最后一条是AI回复且没在生成时,可以重新生成', () => {
    expect(canRegenerate(afterOneTurn)).toBe(true);
  });

  it('生成中不能重新生成', () => {
    expect(canRegenerate({ ...afterOneTurn, streamingId: 'r1' })).toBe(false);
  });

  it('没有消息时不能重新生成', () => {
    expect(canRegenerate(initialChatState)).toBe(false);
  });
});
