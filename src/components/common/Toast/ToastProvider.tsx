// src/components/common/Toast/ToastProvider.tsx
import { useCallback, useState, type ReactNode } from 'react';
import { CircleCheck, CircleAlert } from 'lucide-react';
import clsx from 'clsx';
import { ToastContext, type ToastTone } from './ToastContext';
import styles from './Toast.module.css';

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

const DURATION = 2200; // Figma 메모: 2.2초 후 사라짐
let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, tone: ToastTone = 'default') => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), DURATION);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={styles.region} role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={clsx(styles.toast, styles[t.tone])}>
            {t.tone === 'success' && <CircleCheck aria-hidden="true" />}
            {t.tone === 'error' && <CircleAlert aria-hidden="true" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}