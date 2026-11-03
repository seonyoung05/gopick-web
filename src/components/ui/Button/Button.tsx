// src/components/ui/Button/Button.tsx
import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'ghost' | 'ai' | 'saved' | 'active';
export type ButtonSize = 'md' | 'sm';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Figma의 Type */
  variant?: ButtonVariant;
  /** Figma의 Size */
  size?: ButtonSize;
  /** Figma의 Show Icon + Icon. 넣으면 글자 왼쪽에 표시 */
  icon?: ReactNode;
  /** 부모 너비를 꽉 채울지 (카드 하단 버튼 등) */
  block?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  block = false,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        styles.btn,
        styles[variant],
        styles[size],
        block && styles.block,
        className,
      )}
      {...rest}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
}