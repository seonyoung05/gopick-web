// src/components/ui/Segment/Segment.tsx
import clsx from 'clsx';
import styles from './Segment.module.css';

export type SegmentSize = 'md' | 'lg';

interface SegmentProps<T extends string> {
  options: readonly T[];                      
  value: NoInfer<T>;                          
  onChange: (value: NoInfer<T>) => void;      
  size?: SegmentSize;
  className?: string;
  'aria-label'?: string;
}

export function Segment<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
  'aria-label': ariaLabel,
}: SegmentProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={clsx(styles.segment, styles[size], className)}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            className={clsx(styles.item, selected && styles.selected)}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}