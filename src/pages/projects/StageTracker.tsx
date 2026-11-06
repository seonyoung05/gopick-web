// src/pages/projects/StageTracker.tsx
import clsx from 'clsx';
import { Check } from 'lucide-react';
import { STAGES } from '../../constants/project';
import styles from './StageTracker.module.css';

type StageState = 'done' | 'now' | 'todo';

function stateOf(index: number, currentStage: number): StageState {
  if (index < currentStage) return 'done';
  return index === currentStage ? 'now' : 'todo';
}

/** 목록 카드용 점 5개 + 현재 단계 문구 */
export function StageDots({ currentStage }: { currentStage: number }) {
  const allDone = currentStage >= STAGES.length;
  return (
    <div className={styles.dots}>
      {STAGES.map((name, i) => {
        const state = stateOf(i, currentStage);
        return (
          <span key={name} className={clsx(styles.dot, styles[`dot_${state}`])} title={name}>
            {state === 'done' && <Check size={9} strokeWidth={3} />}
          </span>
        );
      })}
      <span className={styles.dotsLabel}>
        {allDone ? '전 단계 완료' : `${STAGES[currentStage]} 진행 중`}
      </span>
    </div>
  );
}

/** 상세용 단계 표시: 기획 — 설계 — 개발 — 테스트 — 배포 */
export function StagePipeline({ currentStage }: { currentStage: number }) {
  return (
    <ol className={styles.pipeline} aria-label="진행 단계">
      {STAGES.map((name, i) => {
        const state = stateOf(i, currentStage);
        return (
          <li key={name} className={styles.pipelineItem}>
            <span className={clsx(styles.step, styles[`step_${state}`])}>
              {name}
              {state === 'done' && <Check size={14} strokeWidth={3} aria-label="완료" />}
              {state === 'now' && <i className={styles.stepNow} aria-label="진행 중" />}
              {state === 'todo' && <i className={styles.stepTodo} aria-hidden="true" />}
            </span>
            {i < STAGES.length - 1 && <span className={styles.line} aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
