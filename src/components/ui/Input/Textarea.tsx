// src/components/ui/Input/Textarea.tsx
import clsx from 'clsx';
import type { TextareaHTMLAttributes } from 'react';
import styles from './Input.module.css';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ invalid = false, className, ...rest }: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={clsx(styles.field, styles.textarea, invalid && styles.invalid, className)}
      {...rest}
    />
  );
}