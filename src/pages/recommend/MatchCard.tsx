// src/pages/recommend/MatchCard.tsx
import clsx from 'clsx';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Tag } from '../../components/ui/Label';
import { FitLists } from '../../components/common/FitLists';
import type { Recommendation } from '../../types/recommendation';
import { skillSummary } from '../people/filterPeople';
import styles from './RecommendPage.module.css';
import { RelationAction } from '../../components/common/PersonCard';

interface MatchCardProps {
  rec: Recommendation;
  isTie: boolean;
  saved: boolean;
  offered: boolean;
  onViewProfile: () => void;
  onToggleSave: () => void;
  onOffer: () => void;
  onViewApplication: () => void;
}

export function MatchCard({
  rec,
  isTie,
  saved,
  offered,
  onViewProfile,
  onToggleSave,
  onOffer,
  onViewApplication,
}: MatchCardProps) {
  const { person, rank, relation } = rec;

  return (
    <article className={styles.card}>
      <div className={styles.cardInfo}>
        <div className={styles.cardHead}>
          <span className={clsx(styles.rank, rank === 1 ? styles.rankTop : styles.rankOther)}>
            ● {isTie ? '공동 ' : ''}
            {rank}순위
          </span>
          <Avatar name={person.name} seed={person.id} size="sm" />
          <h3 className={styles.name}>{person.name}</h3>
          {person.teamTendency && <Tag tone="gray">{person.teamTendency} 성향</Tag>}
        </div>
        <p className={styles.sub}>
          {person.major} | {skillSummary(person)}
        </p>
        <div className={styles.tags}>
          {person.roles.map((r) => (
            <Tag key={r}>{r}</Tag>
          ))}
        </div>
        <div className={styles.fit}>
          <FitLists matched={rec.matched} unmatched={rec.unmatched} />
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" size="sm" block onClick={onViewProfile}>
          프로필 보기
        </Button>
        <Button variant={saved ? 'saved' : 'ghost'} size="sm" block onClick={onToggleSave} aria-pressed={saved}>
          {saved ? '★ 저장됨' : '☆ 저장'}
        </Button>
        <RelationAction
          relation={relation}
          offered={offered}
          onOffer={onOffer}
          onViewApplication={onViewApplication}
        />
      </div>
    </article>
  );
}