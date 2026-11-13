import { z } from 'zod';
import { LIMITS } from '../config/limits.js';

// 请求体的校验规则: 运行时校验数据 + 自动推导出TS类型(不用再手写一遍type)
export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(LIMITS.maxMessageChars),
});

export const chatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1)
    .max(LIMITS.maxMessages)
    .refine((msgs) => msgs.at(-1)?.role === 'user', { message: 'last message must be from user' }),
  model: z.string().optional(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
