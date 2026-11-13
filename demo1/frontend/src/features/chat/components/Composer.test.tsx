import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Composer } from './Composer';

// 渲染组件,onSend/onStop用 vi.fn() 记录调用情况
function setup(props: Partial<ComponentProps<typeof Composer>> = {}) {
  const onSend = vi.fn();
  const onStop = vi.fn();
  render(<Composer isStreaming={false} canSend onSend={onSend} onStop={onStop} {...props} />);
  return { onSend, onStop, user: userEvent.setup(), textbox: screen.getByRole('textbox') };
}

describe('Composer', () => {
  it('点击发送后调用onSend,并清空输入框', async () => {
    const { onSend, user, textbox } = setup();
    await user.type(textbox, '你好');
    await user.click(screen.getByRole('button', { name: '发送' }));

    expect(onSend).toHaveBeenCalledWith('你好');
    expect(textbox).toHaveValue('');
  });

  it('按Enter发送,Shift+Enter只换行', async () => {
    const { onSend, user, textbox } = setup();
    await user.type(textbox, '第一行{Shift>}{Enter}{/Shift}第二行');
    expect(onSend).not.toHaveBeenCalled();

    await user.keyboard('{Enter}');
    expect(onSend).toHaveBeenCalledWith('第一行\n第二行');
  });

  it('中文输入法选词时按Enter不发送', () => {
    const { onSend, textbox } = setup();
    fireEvent.change(textbox, { target: { value: 'nihao' } });
    fireEvent.keyDown(textbox, { key: 'Enter', isComposing: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('显示字数;超过4000字时变红,并且不能发送', async () => {
    const { user, textbox } = setup();
    await user.click(textbox);
    await user.paste('x'.repeat(4001));

    expect(screen.getByText('4001/4000')).toHaveClass('over');
    expect(screen.getByRole('button', { name: '发送' })).toBeDisabled();
  });

  it('还没选好模型时不能发送', async () => {
    const { user, textbox } = setup({ canSend: false });
    await user.type(textbox, '你好');
    expect(screen.getByRole('button', { name: '发送' })).toBeDisabled();
  });

  it('生成中显示停止按钮,点击后调用onStop', async () => {
    const { onStop, user } = setup({ isStreaming: true });
    await user.click(screen.getByRole('button', { name: '停止' }));
    expect(onStop).toHaveBeenCalledOnce();
  });
});
