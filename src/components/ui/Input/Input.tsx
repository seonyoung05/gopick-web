// src/components/ui/Input/Input.tsx
import clsx from 'clsx';
import type { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 필수 항목 미입력 등 에러 상태 */
  invalid?: boolean;
}

export function Input({ invalid = false, className, ...rest }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={clsx(styles.field, invalid && styles.invalid, className)}
      {...rest}
    />
  );
}