// src/components/ui/Input/Select.tsx
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import type { SelectHTMLAttributes } from 'react';
import styles from './Input.module.css';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: readonly string[];
  invalid?: boolean;
}

export function Select({ options, invalid = false, className, style, ...rest }: SelectProps) {
  return (
    <span className={clsx(styles.selectWrap, className)} style={style}>
      <select
        aria-invalid={invalid || undefined}
        className={clsx(styles.field, styles.select, invalid && styles.invalid)}
        {...rest}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className={styles.chevron} aria-hidden="true" />
    </span>
  );
}