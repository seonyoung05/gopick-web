// src/components/common/Modal/Modal.tsx
import { useEffect, useRef, type ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** 제목. 프로필 상세처럼 제목을 직접 꾸밀 때는 생략하고 header를 사용 */
  title?: string;
  description?: string;
  /** 제목 대신 넣을 머리 영역 */
  header?: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg';
  children?: ReactNode;
}

export function Modal({ open, onClose, title, description, header, footer, size = 'md', children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  // open 값에 맞춰 열고 닫기
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // 모달이 열려 있는 동안 뒤 페이지 스크롤 막기
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={clsx(styles.dialog, size === 'lg' && styles.lg)}
      aria-labelledby={title ? 'modal-title' : undefined}
      onCancel={(e) => {
        e.preventDefault(); // ESC 키: 브라우저가 직접 닫지 않고 onClose로 처리
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // 바깥 어두운 영역 클릭
      }}
    >
      {open && (
        <div className={styles.inner}>
          <div className={styles.head}>
            {header ?? (
              <>
                {title && <h2 id="modal-title" className={styles.title}>{title}</h2>}
                {description && <p className={styles.description}>{description}</p>}
              </>
            )}
          </div>
          <div className={styles.body}>{children}</div>
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      )}
    </dialog>
  );
}