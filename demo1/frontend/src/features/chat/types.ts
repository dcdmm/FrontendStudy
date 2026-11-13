export type ChatRole = 'user' | 'assistant' | 'system';

// 发给后端的消息
export type ChatMessage = { role: ChatRole; content: string };

// 界面上显示的消息(多了id和错误信息)
export type UiMessage = ChatMessage & { id: string; error?: string };
