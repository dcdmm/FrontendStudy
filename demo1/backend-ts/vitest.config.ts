import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 只显示失败测试的控制台输出(每个请求都会打日志,全部显示会淹没测试结果)
    silent: 'passed-only',
  },
});
