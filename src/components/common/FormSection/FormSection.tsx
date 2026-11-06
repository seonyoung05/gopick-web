// src/components/common/FormSection/FormSection.tsx
import type { ReactNode } from 'react';
import styles from './FormSection.module.css';

interface FormSectionProps {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function FormSection({ id, title, description, children }: FormSectionProps) {
  return (
    <section id={id} className={styles.section}>
      <div className={styles.head}>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {children}
    </section>
  );
}