// src/pages/profile/TechLevelList.tsx
import { LevelSelect } from '../../components/ui/LevelSelect';
import { TECH_LEVELS, type TechLevel } from '../../constants/levels';
import styles from './ProfilePage.module.css';

interface TechLevelListProps {
  stacks: string[];
  stackEtc: string;
  levels: Record<string, TechLevel | null>;
  onChange: (stack: string, level: TechLevel) => void;
  /** 4단계에서 사용: 수준을 안 고른 기술 강조 */
  showErrors?: boolean;
}

export function TechLevelList({ stacks, stackEtc, levels, onChange, showErrors }: TechLevelListProps) {
  if (stacks.length === 0) {
    return <p className={styles.emptyLevel}>기술 스택을 고르면 여기에 수준 선택 칸이 생겨요.</p>;
  }

  return (
    <div className={styles.levelList}>
      {stacks.map((stack) => {
        const label = stack === '기타' ? stackEtc || '기타' : stack;
        const missing = showErrors && !levels[stack];
        return (
          <div key={stack} className={styles.levelRow} data-missing={missing || undefined}>
            <span className={styles.levelName}>{label}</span>
            <LevelSelect
              className={styles.levelOptions}
              options={TECH_LEVELS}
              value={levels[stack] ?? null}
              onChange={(level) => onChange(stack, level)}
              aria-label={`${label} 활용 수준`}
            />
          </div>
        );
      })}
    </div>
  );
}