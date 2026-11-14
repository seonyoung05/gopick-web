// src/components/ui/Input/PasswordInput.tsx
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, type InputProps } from './Input';
import styles from './Input.module.css';

export function PasswordInput({ className, ...rest }: Omit<InputProps, 'type'>) {
  const [visible, setVisible] = useState(false);

  return (
    <span className={styles.passwordWrap}>
      <Input
        {...rest}
        type={visible ? 'text' : 'password'}
        className={`${styles.passwordInput} ${className ?? ''}`}
      />
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? '비밀번호 숨기기' : '비밀번호 보기'}
        aria-pressed={visible}
      >
        {visible ? <Eye /> : <EyeOff />}
      </button>
    </span>
  );
}