import type { ChatMessage } from '../../src/schemas/chat.js';

// 快速构造消息,让测试数据更好读
export const user = (content: string): ChatMessage => ({ role: 'user', content });
export const assistant = (content: string): ChatMessage => ({ role: 'assistant', content });
export const system = (content: string): ChatMessage => ({ role: 'system', content });
