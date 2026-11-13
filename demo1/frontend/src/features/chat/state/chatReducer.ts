import type { ChatMessage, ChatRole, UiMessage } from '../types';

// 聊天状态: 所有变化都通过 chatReducer 计算(纯函数: 相同输入永远得到相同输出,方便测试)
export type ChatState = {
  messages: UiMessage[];
  streamingId: string | null; // 正在生成的回复的id,null表示没有在生成
};

export type ChatAction =
  | { type: 'send'; user: UiMessage; reply: UiMessage } // 发送: 加入用户消息和一条空回复
  | { type: 'regenerate'; reply: UiMessage } // 重新生成: 最后一条回复换成新的空回复
  | { type: 'delta'; id: string; text: string } // 收到一段文字
  | { type: 'fail'; id: string; error: string } // 出错
  | { type: 'done'; id: string } // 结束(正常完成、停止、出错都会走到这里)
  | { type: 'reset' }; // 新对话

export const initialChatState: ChatState = { messages: [], streamingId: null };

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'send':
      return { messages: [...state.messages, action.user, action.reply], streamingId: action.reply.id };

    case 'regenerate': {
      const last = state.messages.at(-1);
      const base = last?.role === 'assistant' ? state.messages.slice(0, -1) : state.messages;
      return { messages: [...base, action.reply], streamingId: action.reply.id };
    }

    case 'delta':
      return { ...state, messages: updateById(state.messages, action.id, (m) => ({ ...m, content: m.content + action.text })) };

    case 'fail':
      return { ...state, messages: updateById(state.messages, action.id, (m) => ({ ...m, error: action.error })) };

    case 'done':
      // 只结束对应的那次生成(点了"新对话"后,旧请求的done不能影响新状态)
      return state.streamingId === action.id ? { ...state, streamingId: null } : state;

    case 'reset':
      return initialChatState;
  }
}

// 按id更新一条消息(找不到就不变)
function updateById(messages: UiMessage[], id: string, update: (m: UiMessage) => UiMessage): UiMessage[] {
  return messages.map((m) => (m.id === id ? update(m) : m));
}

export function createMessage(role: ChatRole, content = ''): UiMessage {
  return { id: crypto.randomUUID(), role, content };
}

// 发给后端的历史记录: 去掉出错的和空的消息,只保留role和content
export function toHistory(messages: UiMessage[]): ChatMessage[] {
  return messages.filter((m) => !m.error && m.content).map(({ role, content }) => ({ role, content }));
}

// 能否重新生成: 没在生成中,且最后一条是AI回复
export function canRegenerate(state: ChatState): boolean {
  return state.streamingId === null && state.messages.at(-1)?.role === 'assistant';
}
