import { z } from 'zod';

// 请求体的校验规则: 运行时校验数据 + 自动推导出TS类型(不用再手写一遍type)
export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1),
  model: z.string().optional(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
