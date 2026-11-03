// src/components/ui/Label/Pill.tsx
import clsx from 'clsx';
import styles from './Label.module.css';

/** 제안·지원의 진행 상태 */
export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'canceled';
/** 제안·지원의 종류 */
export type RequestKind = 'apply' | 'offer';

export type PillType = RequestStatus | RequestKind;

const LABEL: Record<PillType, string> = {
  pending: '대기 중',
  accepted: '수락',
  declined: '거절',
  canceled: '취소',
  apply: '지원',
  offer: '제안',
};

interface PillProps {
  /** Figma의 Type */
  type: PillType;
  className?: string;
}

export function Pill({ type, className }: PillProps) {
  return <span className={clsx(styles.pill, styles[type], className)}>{LABEL[type]}</span>;
}