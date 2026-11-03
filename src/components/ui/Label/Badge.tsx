// src/components/ui/Label/Badge.tsx
import clsx from 'clsx';
import styles from './Label.module.css';

interface BadgeProps {
  count: number;
  /** 이 숫자를 넘으면 "99+"처럼 표시 */
  max?: number;
  className?: string;
}

export function Badge({ count, max = 99, className }: BadgeProps) {
  if (count <= 0) return null; // 0이면 아예 안 보이게
  return (
    <span className={clsx(styles.badge, className)} aria-label={`새 알림 ${count}개`}>
      {count > max ? `${max}+` : count}
    </span>
  );
}