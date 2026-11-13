import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 路径别名: @/ 代表 src/(tsconfig.json 里也要配置同样的别名)
  resolve: { alias: { '@': '/src' } },
  server: { port: 5173 },
});
