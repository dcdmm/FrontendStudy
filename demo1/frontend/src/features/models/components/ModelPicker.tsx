import { BACKENDS, type BackendKey } from '../config/backends';

type Props = {
  backend: BackendKey;
  onBackendChange: (backend: BackendKey) => void;
  models: string[];
  model: string;
  onModelChange: (model: string) => void;
  disabled: boolean; // 回复生成中不允许切换
  canReset: boolean;
  onReset: () => void;
};

export function ChatHeader({
  backend, onBackendChange, models, model, onModelChange, disabled, canReset, onReset,
}: Props) {
  return (
    <header className="header">
      <h1>AI Chat Demo</h1>
      <div className="selectors">
        <select
          value={backend}
          onChange={(e) => onBackendChange(e.target.value as BackendKey)}
          disabled={disabled}
        >
          {Object.entries(BACKENDS).map(([key, b]) => (
            <option key={key} value={key}>{b.label}</option>
          ))}
        </select>
        <select
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          disabled={disabled || models.length === 0}
        >
          {models.length === 0 && <option value="">(无可用模型)</option>}
          {models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <button onClick={onReset} disabled={!canReset}>新对话</button>
      </div>
    </header>
  );
}
