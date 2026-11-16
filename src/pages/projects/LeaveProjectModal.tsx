// src/pages/projects/LeaveProjectModal.tsx
import { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import type { LeaveTarget } from './leaveTarget';
import styles from './LeaveProjectModal.module.css';

/** confirm: 나가기 확인 · blocked: 팀장 나가기 불가 안내 · select: 새 팀장 선택 · final: 위임 후 나가기 최종 확인 */
type Step = 'confirm' | 'blocked' | 'select' | 'final';

interface LeaveProjectModalProps {
  target: LeaveTarget | null;
  onClose: () => void;
  /** 그냥 나가기 (모집 중 팀장이 나가면 서버가 모집글을 삭제해요). 성공하면 true */
  onLeave: () => Promise<boolean>;
  /** 새 팀장에게 넘기고 나가기. 성공하면 true */
  onDelegateAndLeave: (targetProfileId: number) => Promise<boolean>;
}

export function LeaveProjectModal({ target, ...rest }: LeaveProjectModalProps) {
  // 열 때마다 처음 단계부터 시작하도록, 닫혀 있을 때는 내용을 그리지 않아요
  return target ? <LeaveFlow target={target} {...rest} /> : null;
}

function Notice({ tone, children }: { tone: 'info' | 'warn'; children: string }) {
  return <p className={tone === 'warn' ? styles.noticeWarn : styles.noticeInfo}>{children}</p>;
}

function SummaryRows({ rows }: { rows: [label: string, value: string][] }) {
  return (
    <dl className={styles.summary}>
      {rows.map(([label, value]) => (
        <div key={label} className={styles.row}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function LeaveFlow({ target, onClose, onLeave, onDelegateAndLeave }: LeaveProjectModalProps & { target: LeaveTarget }) {
  const { title, phase, isLeader, candidates } = target;
  const [step, setStep] = useState<Step>(phase === 'ongoing' && isLeader ? 'blocked' : 'confirm');
  const [pickedId, setPickedId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const picked = candidates.find((c) => c.profileId === pickedId);
  const phaseText = phase === 'ongoing' ? '진행 중' : '모집 중';
  const myAuthority = isLeader ? '팀장' : '팀원';

  const run = async (action: () => Promise<boolean>) => {
    setBusy(true);
    const ok = await action();
    if (ok) onClose();
    else setBusy(false);
  };

  const cancel = (
    <Button variant="ghost" onClick={onClose} disabled={busy}>
      취소
    </Button>
  );
  const danger = (label: string, onClick: () => void) => (
    <Button className={styles.danger} onClick={onClick} disabled={busy}>
      {label}
    </Button>
  );

  // L2 · 진행 중 팀장은 바로 나갈 수 없어요
  if (step === 'blocked') {
    const canDelegate = candidates.length > 0;
    return (
      <Modal
        open
        onClose={onClose}
        title="먼저 팀장을 위임해 주세요"
        description="팀장은 바로 나갈 수 없어요."
        footer={
          <>
            {cancel}
            <Button onClick={() => setStep('select')} disabled={!canDelegate}>
              팀장 위임하기
            </Button>
          </>
        }
      >
        <Notice tone="warn">
          {canDelegate
            ? '진행 중인 프로젝트는 팀장이 비어 있을 수 없어요. 다른 팀원에게 팀장을 넘긴 뒤에 나갈 수 있어요.'
            : '진행 중인 프로젝트는 팀장이 비어 있을 수 없어요. 팀장을 넘길 다른 팀원이 없어서 지금은 나갈 수 없어요.'}
        </Notice>
      </Modal>
    );
  }

  // L3 · 새 팀장 선택
  if (step === 'select') {
    return (
      <Modal
        open
        onClose={onClose}
        title="새 팀장을 선택하세요"
        description="선택한 팀원이 팀장이 되고, 위임 후 나가기를 이어서 진행해요."
        footer={
          <>
            {cancel}
            <Button onClick={() => setStep('final')} disabled={!picked}>
              위임하고 계속
            </Button>
          </>
        }
      >
        <ul className={styles.options}>
          {candidates.map((c) => (
            <li key={c.profileId} className={styles.option}>
              <Checkbox
                className={styles.optionCheck}
                checked={c.profileId === pickedId}
                onChange={(checked) => setPickedId(checked ? c.profileId : null)}
                label={
                  <span className={styles.info}>
                    <strong>{c.name}</strong>
                    <span>{c.role}</span>
                  </span>
                }
              />
            </li>
          ))}
        </ul>
      </Modal>
    );
  }

  // L4 · 위임 후 나가기 최종 확인
  if (step === 'final' && picked) {
    return (
      <Modal
        open
        onClose={onClose}
        title="팀장을 넘기고 나갈까요?"
        description={`${picked.name}님이 ${title}의 새 팀장이 돼요.`}
        footer={
          <>
            {cancel}
            {danger('넘기고 나가기', () => run(() => onDelegateAndLeave(picked.profileId)))}
          </>
        }
      >
        <SummaryRows
          rows={[
            ['새 팀장', picked.name],
            ['프로젝트', title],
            ['내 역할', '팀원으로 변경 후 나가기'],
          ]}
        />
        <Notice tone="warn">위임은 되돌릴 수 없어요.</Notice>
      </Modal>
    );
  }

  // L6 · 모집 중 팀장이 나가면 모집글이 삭제돼요
  if (phase === 'recruiting' && isLeader) {
    return (
      <Modal
        open
        onClose={onClose}
        title="모집글을 삭제하고 나갈까요?"
        description="팀장이 나가면 이 프로젝트 모집은 종료돼요."
        footer={
          <>
            {cancel}
            {danger('모집 삭제하고 나가기', () => run(onLeave))}
          </>
        }
      >
        <SummaryRows
          rows={[
            ['프로젝트', title],
            ['상태', phaseText],
            ['내 역할', myAuthority],
          ]}
        />
        <Notice tone="warn">
          팀장이 나가면 모집이 유지되지 않아요. 모집글이 목록에서 삭제되고 받은 지원도 함께 닫혀요.
        </Notice>
      </Modal>
    );
  }

  // L1(진행 중) · L5(모집 중) 팀원 나가기 확인
  return (
    <Modal
      open
      onClose={onClose}
      title={phase === 'ongoing' ? '프로젝트에서 나갈까요?' : '모집 중인 프로젝트에서 나갈까요?'}
      description={phase === 'ongoing' ? `${title} 프로젝트 팀에서 바로 나갈 수 있어요.` : '팀원은 바로 나갈 수 있어요.'}
      footer={
        <>
          {cancel}
          {danger('프로젝트 나가기', () => run(onLeave))}
        </>
      }
    >
      <SummaryRows
        rows={[
          ['프로젝트', title],
          ['상태', phaseText],
          ['내 역할', myAuthority],
        ]}
      />
      <Notice tone="info">
        {phase === 'ongoing'
          ? '나가면 이 프로젝트의 할 일과 활동 기록은 팀에 남고, 내 이름은 기록에 그대로 표시돼요.'
          : '나가면 빈 자리만큼 모집 인원이 다시 열려요.'}
      </Notice>
    </Modal>
  );
}
