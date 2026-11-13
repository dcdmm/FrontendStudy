/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 路径别名: @/ 代表 src/(tsconfig.json 里也要配置同样的别名)
  resolve: { alias: { '@': '/src' } },
  server: { port: 5173 },
  // Vitest 配置(单元测试、组件测试)
  test: {
    environment: 'jsdom', // 在Node里模拟浏览器环境(document、window等)
    setupFiles: ['./src/test/setup.ts'], // 每个测试文件运行前先执行
  },
});
