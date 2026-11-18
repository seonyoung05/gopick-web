// src/pages/projects/ProjectDetail.tsx
import { useState } from 'react';
import clsx from 'clsx';
import { Check, X } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Status } from '../../components/ui/Label';
import { STAGES } from '../../constants/project';
import type { OutputLink, StageTask, TeamProject } from '../../types/project';
import { LogComposer } from './LogComposer';
import { CompleteProjectModal } from './CompleteProjectModal';
import { ScrapButton } from './ScrapButton';
import { StagePipeline } from './StageTracker';
import { TaskAddForm } from './TaskAddForm';
import styles from './ProjectDetail.module.css';

interface StageAccordionProps {
  name: string;
  index: number;
  currentStage: number;
  tasks: StageTask[];
  editable: boolean;
  onToggleTask: (stage: number, taskIndex: number, done: boolean) => void;
  onAddTask: (stage: number, text: string) => void;
  onRemoveTask: (stage: number, taskIndex: number) => void;
}

function StageAccordion({
  name,
  index,
  currentStage,
  tasks,
  editable,
  onToggleTask,
  onAddTask,
  onRemoveTask,
}: StageAccordionProps) {
  const state = index < currentStage ? 'done' : index === currentStage ? 'now' : 'todo';
  const [open, setOpen] = useState(state === 'now');
  const hasTasks = tasks.length > 0;
  const doneCount = tasks.filter((t) => t.done).length;
  // 과제가 없어도 편집할 수 있으면 열어서 등록할 수 있어야 해요
  const canOpen = hasTasks || editable;

  return (
    <div className={clsx(styles.acc, styles[`acc_${state}`])}>
      <button
        type="button"
        className={styles.accHead}
        aria-expanded={canOpen ? open : undefined}
        disabled={!canOpen}
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
      {open && canOpen && (
        <div className={styles.accBody}>
          {hasTasks && (
            <ul className={styles.tasks}>
              {tasks.map((t, ti) => (
                <li key={`${ti}-${t.text}`} className={styles.taskRow}>
                  <Checkbox
                    checked={t.done}
                    disabled={!editable}
                    onChange={(checked) => onToggleTask(index, ti, checked)}
                    label={t.text}
                  />
                  {editable && (
                    <button
                      type="button"
                      className={styles.taskDel}
                      aria-label={`${t.text} 과제 삭제`}
                      onClick={() => onRemoveTask(index, ti)}
                    >
                      <X size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {editable && (
            <div className={styles.taskAdd}>
              <TaskAddForm stageName={name} onAdd={(text) => onAddTask(index, text)} />
            </div>
          )}
        </div>
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
  /** 단계에 세부 과제를 새로 등록할 때 (editable일 때만 쓰여요) */
  onAddTask: (stage: number, text: string) => void;
  /** 단계의 세부 과제를 지울 때 (editable일 때만 쓰여요) */
  onRemoveTask: (stage: number, taskIndex: number) => void;
  /** 저장하지 않은 활동 기록이 있는지 */
  logsDirty: boolean;
  /** 활동 기록을 저장할 때 (editable일 때만 쓰여요) */
  onSaveLogs: () => void;
  /** 저장하지 않은 세부 과제 수정이 있는지 */
  tasksDirty: boolean;
  /** 세부 과제를 저장할 때 (editable일 때만 쓰여요) */
  onSaveTasks: () => void;
  /** 있으면 진행 단계를 눌러 바꿀 수 있음 (진행 중 프로젝트의 팀원) */
  onChangeStage?: (stage: number) => void;
  /** 있으면 '프로젝트 완료' 버튼 표시 (진행 중 프로젝트의 팀장). 산출물(GitHub 필수)을 받아 호출돼요 */
  onComplete?: (outputs: OutputLink[]) => void;
  /** 있으면 '프로젝트 나가기' 버튼 표시 (팀장이 아닌 팀원) */
  onLeave?: () => void;
  /** 활동 기록에 표시될 내 이름 */
  author: string;
  /** 활동 기록을 새로 남길 때 (editable일 때만 쓰여요) */
  onAddLog: (text: string) => void;
}

export function ProjectDetail({
  project: p,
  editable,
  onToggleScrap,
  onToggleTask,
  onAddTask,
  onRemoveTask,
  logsDirty,
  onSaveLogs,
  tasksDirty,
  onSaveTasks,
  onChangeStage,
  onComplete,
  onLeave,
  author,
  onAddLog,
}: ProjectDetailProps) {
  const isDone = p.currentStage >= STAGES.length;
  const [completing, setCompleting] = useState(false);

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
        {p.members.map((m, i) => (
          <li key={`${m.profileId ?? m.name}-${i}`} className={styles.member}>
            <Avatar
              name={m.name}
              // 탑바·프로필과 같은 색이 되도록 profileId 기준 (탈퇴한 회원은 회색)
              seed={m.profileId ?? undefined}
              color={m.profileId === null ? 'muted' : undefined}
              size="sm"
            />
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

      <h4 className={styles.h}>
        진행 단계 {editable && onChangeStage && <small>단계를 눌러 바꿀 수 있어요</small>}
      </h4>
      <StagePipeline
        currentStage={p.currentStage}
        completed={isDone}
        onSelect={editable ? onChangeStage : undefined}
        onComplete={editable && onComplete && !isDone ? () => setCompleting(true) : undefined}
      />
      {onComplete && !isDone && (
        <div className={styles.stageControls}>
          <Button size="sm" variant="ghost" onClick={() => setCompleting(true)}>
            프로젝트 완료로 바꾸기
          </Button>
        </div>
      )}
      {onComplete && (
        <CompleteProjectModal
          open={completing}
          projectTitle={p.title}
          onClose={() => setCompleting(false)}
          onConfirm={(outputs) => {
            setCompleting(false);
            onComplete(outputs);
          }}
        />
      )}

      <h4 className={styles.h}>
        단계별 세부 과제 <small>선택</small>
        {editable && <small> · 단계를 열어 과제를 글로 적어 등록할 수 있어요</small>}
      </h4>
      <div className={styles.accs}>
        {STAGES.map((name, i) => (
          <StageAccordion
            // 진행 중 단계가 바뀌면 새로 그려서, 지금 단계가 자동으로 열리게 해요
            key={`${name}-${i === p.currentStage}`}
            name={name}
            index={i}
            currentStage={p.currentStage}
            tasks={p.tasks[i]}
            editable={editable}
            onToggleTask={onToggleTask}
            onAddTask={onAddTask}
            onRemoveTask={onRemoveTask}
          />
        ))}
      </div>

      {editable && (
        <div className={styles.saveRow}>
          {tasksDirty && <span className={styles.saveHint}>저장하지 않은 변경이 있어요</span>}
          <Button size="sm" className={styles.saveButton} disabled={!tasksDirty} onClick={onSaveTasks}>
            세부 과제 저장
          </Button>
        </div>
      )}

      <h4 className={styles.h}>활동 기록</h4>
      {editable && <LogComposer author={author} onSubmit={onAddLog} />}
      {p.log.length === 0 && <p className={styles.notice}>아직 활동 기록이 없어요.</p>}
      <ol className={styles.log}>
        {p.log.map((l, i) => (
          <li key={`${l.date}-${i}-${l.text}`}>
            <span className={styles.logMeta}>
              {l.date}, {l.author}
            </span>
            <p>{l.text}</p>
          </li>
        ))}
      </ol>
      {editable && (
        <div className={styles.saveRow}>
          {logsDirty && <span className={styles.saveHint}>저장하지 않은 기록이 있어요</span>}
          <Button size="sm" className={styles.saveButton} disabled={!logsDirty} onClick={onSaveLogs}>
            활동 기록 저장
          </Button>
        </div>
      )}

      {onLeave && (
        <div className={styles.leaveControls}>
          <Button size="sm" variant="ghost" className={styles.leaveButton} onClick={onLeave}>
            프로젝트 나가기
          </Button>
        </div>
      )}
    </section>
  );
}
