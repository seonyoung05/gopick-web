// src/components/common/Field/Field.tsx
import clsx from 'clsx';
import type { ReactNode } from 'react';
import styles from './Field.module.css';

interface FieldProps {
  label: string;
  /** "필수" / "추천 필수" / "조건부 필수" — 없으면 표시 안 함 */
  req?: string;
  /** 라벨 옆 회색 안내 (예: "복수 선택") */
  hint?: string;
  /** 입력칸 아래 설명 */
  help?: string;
  /** 입력칸 아래 빨간 에러 문구 */
  error?: string;
  /** input과 라벨을 연결할 때 사용 */
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}

export function Field({ label, req, hint, help, error, htmlFor, className, children }: FieldProps) {
  return (
    <div className={clsx(styles.field, className)}>
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor={htmlFor}>
          {label}
        </label>
        {req && <span className={styles.req}>{req}</span>}
        {hint && <span className={styles.hint}>{hint}</span>}
      </div>
      {children}
      {help && <p className={styles.help}>{help}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}