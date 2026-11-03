// src/components/ui/Label/Status.tsx
import clsx from 'clsx';
import styles from './Label.module.css';

export type ProjectStatus = 'recruit' | 'ongoing' | 'done';

const LABEL: Record<ProjectStatus, string> = {
  recruit: '모집 중',
  ongoing: '진행 중',
  done: '완료',
};

interface StatusProps {
  status: ProjectStatus;
  className?: string;
}

export function Status({ status, className }: StatusProps) {
  return (
    <span className={clsx(styles.status, styles[status], className)}>
      <span className={styles.dot} aria-hidden="true" />
      {LABEL[status]}
    </span>
  );
}