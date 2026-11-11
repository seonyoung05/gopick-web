// src/pages/projects/ProjectDetail.tsx
import { useState } from 'react';
import clsx from 'clsx';
import { Check } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Checkbox } from '../../components/ui/Checkbox';
import { Status } from '../../components/ui/Label';
import { STAGES } from '../../constants/project';
import type { StageTask, TeamProject } from '../../types/project';
import { ScrapButton } from './ScrapButton';
import { StagePipeline } from './StageTracker';
import styles from './ProjectDetail.module.css';

interface StageAccordionProps {
  name: string;
  index: number;
  currentStage: number;
  tasks: StageTask[];
  editable: boolean;
  onToggleTask: (stage: number, taskIndex: number, done: boolean) => void;
}

function StageAccordion({ name, index, currentStage, tasks, editable, onToggleTask }: StageAccordionProps) {
  const state = index < currentStage ? 'done' : index === currentStage ? 'now' : 'todo';
  const [open, setOpen] = useState(state === 'now');
  const hasTasks = tasks.length > 0;
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div className={clsx(styles.acc, styles[`acc_${state}`])}>
      <button
        type="button"
        className={styles.accHead}
        aria-expanded={hasTasks ? open : undefined}
        disabled={!hasTasks}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.accIcon} aria-hidden="true">
          {state === 'done' ? <Check size={13} strokeWidth={3} /> : <i />}
        </span>
        <strong>{name}</strong>
        <span className={styles.accCount}>
          {hasTasks ? (
            <>
              과제 <b>{doneCount}/{tasks.length}</b> 완료
            </>
          ) : (
            '등록된 과제 없음'
          )}
        </span>
      </button>
      {open && hasTasks && (
        <ul className={styles.tasks}>
          {tasks.map((t, ti) => (
            <li key={t.text}>
              <Checkbox
                checked={t.done}
                disabled={!editable}
                onChange={(checked) => onToggleTask(index, ti, checked)}
                label={t.text}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface ProjectDetailProps {
  project: TeamProject;
  /** 팀 구성원만 과제를 수정할 수 있음 (완료 프로젝트는 읽기 전용) */
  editable: boolean;
  onToggleScrap: () => void;
  onToggleTask: (stage: number, taskIndex: number, done: boolean) => void;
}

export function ProjectDetail({ project: p, editable, onToggleScrap, onToggleTask }: ProjectDetailProps) {
  const isDone = p.currentStage >= STAGES.length;

  return (
    <section className={styles.detail} aria-label={`${p.title} 상세`}>
      <div className={styles.head}>
        <div>
          <h2 className={styles.title}>
            {p.title}
            <Status status={isDone ? 'done' : 'ongoing'} />
          </h2>
          <p className={styles.meta}>
            {p.group}, 팀원 {p.members.length}명{p.period ? `, ${p.period}` : ''} | 최근 활동 {p.lastActive}
          </p>
          <p className={styles.desc}>{p.description}</p>
        </div>
        <div className={styles.scrap}>
          <ScrapButton scrapped={p.scrapped} onToggle={onToggleScrap} />
        </div>
      </div>

      <p className={styles.notice}>
        진행 정보는 모든 구성원에게 공개돼요. 단계·세부 과제·상태 수정은 이 프로젝트의 팀 구성원만 할 수 있어요.
      </p>

      <h4 className={styles.h}>구성원</h4>
      <ul className={styles.members}>
        {p.members.map((m) => (
          <li key={m.name} className={styles.member}>
            <Avatar name={m.name} size="sm" />
            <strong>{m.name}</strong>
            <span>{m.role}</span>
          </li>
        ))}
      </ul>

      {p.outputs && (
        <>
          <h4 className={styles.h}>산출물</h4>
          <ul className={styles.outputs}>
            {p.outputs.map((o) => (
              <li key={o.label}>
                {o.label}{' '}
                <a href={o.url} target="_blank" rel="noreferrer">
                  {o.url}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      <h4 className={styles.h}>진행 단계</h4>
      <StagePipeline currentStage={p.currentStage} />

      <h4 className={styles.h}>
        단계별 세부 과제 <small>선택</small>
      </h4>
      <div className={styles.accs}>
        {STAGES.map((name, i) => (
          <StageAccordion
            key={name}
            name={name}
            index={i}
            currentStage={p.currentStage}
            tasks={p.tasks[i]}
            editable={editable}
            onToggleTask={onToggleTask}
          />
        ))}
      </div>

      <h4 className={styles.h}>활동 기록</h4>
      <ol className={styles.log}>
        {p.log.map((l) => (
          <li key={l.date + l.text}>
            <span className={styles.logMeta}>
              {l.date}, {l.author}
            </span>
            <p>{l.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
