// src/components/ui/LevelSelect/LevelSelect.tsx
import clsx from 'clsx';
import styles from './LevelSelect.module.css';

export interface LevelOptionItem<T extends string> {
  value: T;
  desc: string;
}

interface LevelSelectProps<T extends string> {
  options: readonly LevelOptionItem<T>[];
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
  'aria-label'?: string;
}

export function LevelSelect<T extends string>({
  options,
  value,
  onChange,
  className,
  'aria-label': ariaLabel,
}: LevelSelectProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={clsx(styles.group, className)}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={clsx(styles.option, selected && styles.selected)}
            onClick={() => onChange(option.value)}
          >
            <span className={styles.title}>{option.value}</span>
            <span className={styles.desc}>{option.desc}</span>
          </button>
        );
      })}
    </div>
  );
}