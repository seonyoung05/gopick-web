// src/components/ui/Label/Tag.tsx
import clsx from 'clsx';
import type { ReactNode } from 'react';
import styles from './Label.module.css';

export type TagTone = 'gray' | 'blue';

interface TagProps {
  tone?: TagTone;
  className?: string;
  children: ReactNode;
}

export function Tag({ tone = 'blue', className, children }: TagProps) {
  return <span className={clsx(styles.tag, styles[tone], className)}>{children}</span>;
}