import '@testing-library/jest-dom/vitest'; // 增加 toBeInTheDocument、toBeDisabled 等DOM断言
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';

// jsdom没有实现 scrollIntoView(消息列表自动滚动会用到),给一个空实现
Element.prototype.scrollIntoView = () => {};

// 有没被模拟的请求时直接报错,避免测试悄悄去请求真实后端
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));

afterEach(() => {
  cleanup(); // 卸载上一个测试渲染的组件
  server.resetHandlers(); // 撤销测试里用 server.use() 临时覆盖的接口
});

afterAll(() => server.close());
