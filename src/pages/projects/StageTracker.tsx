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

interface StagePipelineProps {
  /** 0~4: 해당 단계 진행 중, 5: 배포까지 모두 끝남(완료 처리만 남음) */
  currentStage: number;
  /** 프로젝트가 완료 처리됐는지. true면 '완료'까지 모두 ✓로 보여요. */
  completed: boolean;
  /** 넘기면 단계를 눌러 바꿀 수 있어요. 안 넘기면 보기만 가능해요. */
  onSelect?: (stage: number) => void;
  /** 넘기면 마지막 '완료'를 눌러 프로젝트를 완료 처리할 수 있어요. */
  onComplete?: () => void;
}

interface Step {
  name: string;
  state: StageState;
  title: string;
  /** 있으면 버튼, 없으면 보기만 가능한 글자로 그려요 */
  onClick?: () => void;
}

/** 상세용 단계 표시: 기획 — 설계 — 개발 — 테스트 — 배포 — 완료 */
export function StagePipeline({ currentStage, completed, onSelect, onComplete }: StagePipelineProps) {
  const steps: Step[] = [
    ...STAGES.map((name, i) => {
      const state = stateOf(i, currentStage);
      return {
        name,
        state,
        title:
          state === 'now'
            ? `한 번 더 누르면 ${name} 단계가 끝난 것(✓)으로 표시돼요`
            : `${name} 단계로 바꾸기`,
        onClick: onSelect ? () => onSelect(i) : undefined,
      };
    }),
    {
      name: '완료',
      // 배포까지 모두 끝났으면 '완료'가 다음 차례(●)로 보여요
      state: completed ? 'done' : currentStage >= STAGES.length ? 'now' : 'todo',
      title: completed ? '완료된 프로젝트예요' : '프로젝트 완료 처리하기',
      onClick: onComplete && !completed ? onComplete : undefined,
    },
  ];

  return (
    <ol className={styles.pipeline} aria-label="진행 단계">
      {steps.map(({ name, state, title, onClick }, i) => {
        const className = clsx(styles.step, styles[`step_${state}`], onClick && styles.stepButton);
        const content = (
          <>
            {name}
            {state === 'done' && <Check size={14} strokeWidth={3} aria-label="완료" />}
            {state === 'now' && <i className={styles.stepNow} aria-label="진행 중" />}
            {state === 'todo' && <i className={styles.stepTodo} aria-hidden="true" />}
          </>
        );
        return (
          <li key={name} className={styles.pipelineItem}>
            {onClick ? (
              <button
                type="button"
                className={className}
                aria-current={state === 'now' ? 'step' : undefined}
                title={title}
                onClick={onClick}
              >
                {content}
              </button>
            ) : (
              <span className={className}>{content}</span>
            )}
            {i < steps.length - 1 && <span className={styles.line} aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
