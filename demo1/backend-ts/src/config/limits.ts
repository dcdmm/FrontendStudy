// 业务限制(单条消息字数要和前端 shared/config/limits.ts 保持一致)
export const LIMITS = {
  maxMessageChars: 4000, // 单条消息最多字符数
  maxMessages: 100, // 一次请求最多带多少条消息
  maxContextChars: 12000, // 发给模型的上下文总字符数,超出时丢掉最早的消息
  chatRateLimit: { windowMs: 60_000, max: 20 }, // 每个客户端每分钟最多发20次聊天请求
};
