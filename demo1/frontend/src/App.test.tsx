import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import App from './App';
import { API, deltas, sseResponse } from './test/mocks/handlers';
import { server } from './test/mocks/server';

// 页面级测试: 渲染整个App,后端由MSW模拟,检查多个功能配合起来是否正常

async function renderApp() {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole('option', { name: 'model-b' }); // 等模型列表加载完
  return user;
}

async function send(user: UserEvent, text: string) {
  await user.type(screen.getByRole('textbox'), text);
  await user.click(screen.getByRole('button', { name: '发送' }));
}

describe('App', () => {
  it('发送消息后显示流式回复,并可以重新生成', async () => {
    const user = await renderApp();
    await send(user, '讲个故事');

    expect(screen.getByText('讲个故事')).toBeInTheDocument();
    expect(await screen.findByText('从前有座山,山里有座庙')).toBeInTheDocument();

    // 第二次请求返回不同的内容
    server.use(http.post(`${API}/chat`, () => sseResponse(deltas('换一个故事'))));
    await user.click(screen.getByRole('button', { name: '重新生成' }));

    expect(await screen.findByText('换一个故事')).toBeInTheDocument();
    expect(screen.queryByText('从前有座山,山里有座庙')).not.toBeInTheDocument();
  });

  it('点击"新对话"清空消息', async () => {
    const user = await renderApp();
    await send(user, '讲个故事');
    await screen.findByText('从前有座山,山里有座庙');

    await user.click(screen.getByRole('button', { name: '新对话' }));
    expect(screen.getByText('开始对话吧～')).toBeInTheDocument();
  });

  it('后端连不上时,顶部显示提示', async () => {
    server.use(http.get(`${API}/models`, () => HttpResponse.error()));
    render(<App />);
    expect(await screen.findByText('无法获取模型列表: 无法连接后端,请确认后端已启动')).toBeInTheDocument();
  });

  it('请求太频繁时,在回复里提示要等几秒', async () => {
    server.use(
      http.post(`${API}/chat`, () =>
        HttpResponse.json({ error: { message: 'too many' } }, { status: 429, headers: { 'Retry-After': '30' } }),
      ),
    );
    const user = await renderApp();
    await send(user, 'hi');
    expect(await screen.findByText('出错了: 请求太频繁,请 30 秒后再试')).toBeInTheDocument();
  });
});
