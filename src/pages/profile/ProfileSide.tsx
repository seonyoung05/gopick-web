// src/pages/profile/ProfileSide.tsx
import { Avatar } from '../../components/ui/Avatar';
import { Tag } from '../../components/ui/Label';
import type { ProfileForm } from '../../types/profile';
import styles from './ProfilePage.module.css';

export interface TocItem {
  id: string;
  label: string;
  status: string; // '완료' 또는 '1개', '작성함' 같은 요약
  done: boolean;
}

interface ProfileSideProps {
  form: ProfileForm;
  requiredDone: number;
  requiredTotal: number;
  toc: TocItem[];
}

export function ProfileSide({ form, requiredDone, requiredTotal, toc }: ProfileSideProps) {
  const percent = requiredTotal ? (requiredDone / requiredTotal) * 100 : 0;

  return (
    <aside className={styles.side}>
      <Avatar name={form.name || '?'} size="xl" color={form.name ? undefined : 'muted'} />
      <p className={styles.sideName}>{form.name || '이름을 입력해 주세요'}</p>
      <p className={styles.sideMajor}>{form.major || '전공'}</p>
      <div className={styles.sideParts}>
        {form.parts.map((p) => (
          <Tag key={p}>{p}</Tag>
        ))}
      </div>

      <div className={styles.meterRow}>
        <span>필수 항목</span>
        <strong>
          {requiredDone} / {requiredTotal}
        </strong>
      </div>
      <div className={styles.meterBar}>
        <div className={styles.meterFill} style={{ width: `${percent}%` }} />
      </div>

      <nav className={styles.toc} aria-label="프로필 목차">
        {toc.map((item) => (
          <a key={item.id} href={`#${item.id}`} className={styles.tocItem}>
            {item.label}
            <span className={item.done ? styles.tocDone : styles.tocTodo}>{item.status}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}