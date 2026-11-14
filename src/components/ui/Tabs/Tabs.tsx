// src/components/ui/Tabs/Tabs.tsx
import clsx from 'clsx';
import { Badge } from '../Label';
import styles from './Tabs.module.css';

export interface TabItem<T extends string> {
  value: T;
  label: string;
  /** 빨간 배지 숫자 (0이거나 없으면 숨김) */
  count?: number;
}

interface TabsProps<T extends string> {
  items: readonly TabItem<T>[];
  value: NoInfer<T>;
  onChange: (value: NoInfer<T>) => void;
  className?: string;
  'aria-label'?: string;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
  'aria-label': ariaLabel,
}: TabsProps<T>) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={clsx(styles.tabs, className)}>
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={selected}
            className={clsx(styles.tab, selected && styles.selected)}
            onClick={() => onChange(item.value)}
          >
            {item.label}
            {item.count !== undefined && <Badge count={item.count} />}
          </button>
        );
      })}
    </div>
  );
}