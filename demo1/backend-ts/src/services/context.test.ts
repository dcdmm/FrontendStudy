import { describe, expect, it } from 'vitest';
import { assistant, system, user } from '../../tests/fixtures/messages.js';
import { trimHistory } from './context.js';

describe('trimHistory', () => {
  it('总长度没超过上限时原样返回', () => {
    const messages = [user('aa'), assistant('bb'), user('cc')];
    expect(trimHistory(messages, 100)).toEqual(messages);
  });

  it('超过上限时,从最早的消息开始丢弃', () => {
    const messages = [user('1111'), assistant('2222'), user('3333'), assistant('44'), user('55')];
    // 从最新往前累加: 55(2) → 44(4) → 3333(8) → 2222(12,超过10,停止)
    expect(trimHistory(messages, 10)).toEqual([user('3333'), assistant('44'), user('55')]);
  });

  it('裁剪后开头是AI回复时也去掉,保证上下文从用户提问开始', () => {
    const messages = [user('1111'), assistant('22'), user('33')];
    // 33和22放得下,1111放不下;剩下的开头是AI回复22,所以也去掉
    expect(trimHistory(messages, 5)).toEqual([user('33')]);
  });

  it('最后一条消息再长也保留', () => {
    const long = user('x'.repeat(50));
    expect(trimHistory([user('aa'), assistant('bb'), long], 10)).toEqual([long]);
  });

  it('system消息始终保留,并放到最前面', () => {
    const messages = [user('1111'), system('rule'), user('33')];
    // rule(4) + 33(2) = 6,再加1111就超了
    expect(trimHistory(messages, 6)).toEqual([system('rule'), user('33')]);
  });
});
