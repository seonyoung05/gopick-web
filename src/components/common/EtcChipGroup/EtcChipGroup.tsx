// src/components/common/EtcChipGroup/EtcChipGroup.tsx
import { ChipGroup, type ChipSize } from '../../ui/Chip';
import { Input } from '../../ui/Input';
import styles from './EtcChipGroup.module.css';

interface EtcChipGroupProps {
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
  /** '기타' 직접 입력값 */
  etcValue: string;
  onEtcChange: (value: string) => void;
  /** 입력칸 안내 문구 */
  etcPlaceholder?: string;
  /** 직접 입력을 띄울 선택지 이름 (기본: '기타') */
  etcOption?: string;
  size?: ChipSize;
  'aria-label'?: string;
}

export function EtcChipGroup({
  options,
  value,
  onChange,
  etcValue,
  onEtcChange,
  etcPlaceholder = '직접 입력해 주세요',
  etcOption = '기타',
  size = 'md',
  'aria-label': ariaLabel,
}: EtcChipGroupProps) {
  const hasEtc = value.includes(etcOption);

  const handleChange = (next: string[]) => {
    onChange(next);
    // '기타'를 해제하면 입력해 둔 값도 비우기
    if (!next.includes(etcOption) && etcValue) onEtcChange('');
  };

  return (
    <div className={styles.wrap}>
      <ChipGroup
        multiple
        size={size}
        options={options}
        value={value}
        onChange={handleChange}
        aria-label={ariaLabel}
      />
      {hasEtc && (
        <Input
          className={styles.input}
          placeholder={etcPlaceholder}
          value={etcValue}
          onChange={(e) => onEtcChange(e.target.value)}
          aria-label={`${ariaLabel ?? ''} 기타 직접 입력`}
          autoFocus
        />
      )}
    </div>
  );
}