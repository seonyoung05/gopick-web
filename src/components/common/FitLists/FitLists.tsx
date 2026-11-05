// src/components/common/FitLists/FitLists.tsx
import clsx from 'clsx';
import { MATCH_LABEL, sortByPriority } from '../../../constants/recommendation';
import type { MatchReason } from '../../../types/recommendation';
import styles from './FitLists.module.css';

interface FitListsProps {
  matched: MatchReason[];
  unmatched: MatchReason[];
}

function ReasonList({ reasons, ok }: { reasons: MatchReason[]; ok: boolean }) {
  return (
    <div className={clsx(styles.box, ok ? styles.okBox : styles.noBox)}>
      <p className={clsx(styles.title, ok ? styles.ok : styles.no)}>{ok ? '일치 항목' : '불일치 항목'}</p>
      <ul className={styles.list}>
        {reasons.length === 0 ? (
          <li className={styles.empty}>없음</li>
        ) : (
          sortByPriority(reasons).map((r, i) => (
            <li key={i} className={styles.item}>
              <span className={clsx(styles.mark, ok ? styles.ok : styles.no)} aria-hidden="true">
                {ok ? '✓' : '✕'}
              </span>
              <span>
                <span className={styles.category}>{MATCH_LABEL[r.category]}:</span> {r.text}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export function FitLists({ matched, unmatched }: FitListsProps) {
  return (
    <div className={styles.wrap}>
      <ReasonList reasons={matched} ok />
      <ReasonList reasons={unmatched} ok={false} />
    </div>
  );
}