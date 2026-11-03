// src/components/ui/Stepper/Stepper.tsx
import clsx from 'clsx';
import { Minus, Plus } from 'lucide-react';
import styles from './Stepper.module.css';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** 숫자 뒤에 붙는 단위 (예: "명") */
  unit?: string;
  className?: string;
  /** 화면 낭독기용 이름 (예: "Backend 모집 인원") */
  'aria-label'?: string;
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  unit = '명',
  className,
  'aria-label': ariaLabel,
}: StepperProps) {
  return (
    <div className={clsx(styles.stepper, className)} role="group" aria-label={ariaLabel}>
      <button
        type="button"
        className={styles.btn}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="줄이기"
      >
        <Minus />
      </button>
      <span className={styles.value} aria-live="polite">
        {value}
        {unit}
      </span>
      <button
        type="button"
        className={styles.btn}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="늘리기"
      >
        <Plus />
      </button>
    </div>
  );
}