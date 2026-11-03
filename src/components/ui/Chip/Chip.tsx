// src/components/ui/Chip/Chip.tsx
import clsx from 'clsx';
import type { ButtonHTMLAttributes } from 'react';
import styles from './Chip.module.css';

export type ChipSize = 'md' | 'compact';
export type ChipSelectedStyle = 'soft' | 'filled';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  /** 선택됐을 때 모양: soft = 복수 선택용, filled = 단일 선택용 */
  selectedStyle?: ChipSelectedStyle;
  size?: ChipSize;
}

export function Chip({
  selected = false,
  selectedStyle = 'soft',
  size = 'md',
  type = 'button',
  className,
  children,
  ...rest
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={clsx(
        styles.chip,
        styles[size],
        selected && [styles.selected, styles[selectedStyle]],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}