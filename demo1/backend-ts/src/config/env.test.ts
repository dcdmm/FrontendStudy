import { describe, expect, it } from 'vitest';
import { loadEnv } from './env.js';

// describe: 测试分组,一般以被测函数命名
describe('loadEnv', () => {
  // it: 一个测试用例,名字描述期望的行为
  it('只填API key时,其他项使用默认值', () => {
    // expect(实际值).toEqual(期望值): 断言,两者不一致则测试失败
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
});
