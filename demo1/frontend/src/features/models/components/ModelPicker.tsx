import { BACKENDS, type BackendKey } from '@/shared/config/backends';

type Props = {
  backend: BackendKey;
  onBackendChange: (backend: BackendKey) => void;
  models: string[];
  model: string;
  onModelChange: (model: string) => void;
  disabled: boolean; // 回复生成中不允许切换
};

// 后端和模型的下拉选择框
export function ModelPicker({ backend, onBackendChange, models, model, onModelChange, disabled }: Props) {
  return (
    <>
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
    </>
  );
}
