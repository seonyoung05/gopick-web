// src/pages/project-form/FormParts.tsx
// 이 폼 안에서만 쓰는 작은 조각들 (공통 컴포넌트가 아님)
import type { ReactNode } from 'react';
import s from './FormSections.module.css';

interface FieldLabelProps {
  children: ReactNode;
  htmlFor?: string;
  /** "추천 필수" 빨간 글씨 */
  required?: boolean;
  /** 라벨 옆 작은 회색 안내 (예: "복수 선택") */
  hint?: string;
}

export function FieldLabel({ children, htmlFor, required = false, hint }: FieldLabelProps) {
  return (
    <label className={s.label} htmlFor={htmlFor}>
      <span>{children}</span>
      {required && <em className={s.req}>추천 필수</em>}
      {hint && <small className={s.hint}>{hint}</small>}
    </label>
  );
}

export function FieldError({ show, children }: { show: boolean; children: ReactNode }) {
  if (!show) return null;
  return (
    <p className={s.error} role="alert">
      {children}
    </p>
  );
}
