import { describe, expect, it } from 'vitest';
import { loadEnv } from './env.js';

describe('loadEnv', () => {
  it('只填API key时,其他项使用默认值', () => {
    expect(loadEnv({ OPENROUTER_API_KEY: 'sk-test' })).toEqual({
      OPENROUTER_API_KEY: 'sk-test',
      OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1',
      OPENROUTER_PORT: 8787,
    });
  });

  it('端口从字符串转换成数字(环境变量都是字符串)', () => {
    expect(loadEnv({ OPENROUTER_API_KEY: 'sk-test', OPENROUTER_PORT: '3000' }).OPENROUTER_PORT).toBe(3000);
  });

  it('缺少API key时报错,并指出是哪一项', () => {
    expect(() => loadEnv({})).toThrow('OPENROUTER_API_KEY');
  });

  it('地址格式不对时报错', () => {
    expect(() => loadEnv({ OPENROUTER_API_KEY: 'sk-test', OPENROUTER_BASE_URL: 'not-a-url' }))
      .toThrow('OPENROUTER_BASE_URL');
  });
});
