// src/components/ui/Label/MineLabel.tsx
import clsx from 'clsx';
import styles from './Label.module.css';

export function MineLabel({ className }: { className?: string }) {
  return <span className={clsx(styles.mine, className)}>내 프로젝트</span>;
}