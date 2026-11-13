import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// MSW: 拦截测试中发出的fetch请求,返回假数据(不需要启动真实后端)
export const server = setupServer(...handlers);
