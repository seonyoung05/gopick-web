// src/components/common/PersonCard/PersonCard.tsx
import type { ReactNode } from 'react';
import { Avatar } from '../../ui/Avatar';
import { Tag } from '../../ui/Label';
import { Button } from '../../ui/Button';
import type { PersonSummary } from '../../../types/person';
import styles from './PersonCard.module.css';

interface PersonCardProps {
  person: PersonSummary;
  /** 기술 요약 문구 (예: "Java 기초 경험, SQL 기초 경험") */
  skillText: string;
  saved: boolean;
  onToggleSave: () => void;
  onViewProfile: () => void;
  /** 세 번째 버튼 (화면마다 다름) */
  action?: ReactNode;
}

export function PersonCard({ person, skillText, saved, onToggleSave, onViewProfile, action }: PersonCardProps) {
  if (!person.isPublic) {
    return (
      <article className={`${styles.card} ${styles.private}`}>
        <Avatar name={person.name} color="muted" />
        <div className={styles.info}>
          <div className={styles.nameRow}>
            <h3 className={styles.name}>{person.name}</h3>
            <span className={styles.privateLabel}>비공개 프로필</span>
          </div>
          <p className={styles.skills}>
            저장한 뒤 프로필이 비공개로 바뀌었어요. 다시 공개되면 정보를 볼 수 있어요.
          </p>
        </div>
        <div className={styles.actions}>
          <Button
            variant={saved ? 'saved' : 'ghost'}
            size="sm"
            block
            onClick={onToggleSave}
            aria-pressed={saved}
          >
            {saved ? '★ 저장됨' : '☆ 저장'}
          </Button>
        </div>
      </article>
    );
  }
  return (
    <article className={styles.card}>
      <Avatar name={person.name} seed={person.id} />

      <div className={styles.info}>
        <div className={styles.nameRow}>
          <h3 className={styles.name}>{person.name}</h3>
          <span className={styles.major}>{person.major}</span>
        </div>
        <div className={styles.tags}>
          {person.roles.map((r) => (
            <Tag key={r}>{r}</Tag>
          ))}
        </div>
        <p className={styles.skills}>{skillText}</p>
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" size="sm" block onClick={onViewProfile}>
          프로필 보기
        </Button>
        <Button
          variant={saved ? 'saved' : 'ghost'}
          size="sm"
          block
          onClick={onToggleSave}
          aria-pressed={saved}
        >
          {saved ? '★ 저장됨' : '☆ 저장'}
        </Button>
        {action}
      </div>
    </article>
  );
}