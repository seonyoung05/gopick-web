// src/pages/project-form/DeleteProjectModal.tsx
// 프로젝트 삭제 확인 모달 (팀장만). 나가기 모달과 같은 모양
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/ui/Button';
import styles from '../projects/LeaveProjectModal.module.css';

interface DeleteProjectModalProps {
  /** 삭제할 프로젝트 (null이면 닫힘) */
  target: { title: string; status: string; memberCount: number; archived?: boolean } | null;
  busy: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export function DeleteProjectModal({ target, busy, onClose, onDelete }: DeleteProjectModalProps) {
  if (!target) return null;
  const rows: [string, string][] = [
    ['프로젝트', target.title],
    ['상태', target.status],
    ['구성원', `${target.memberCount}명`],
  ];

  return (
    <Modal
      open
      onClose={busy ? () => undefined : onClose}
      title="프로젝트를 삭제할까요?"
      description="삭제하면 되돌릴 수 없어요."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            취소
          </Button>
          <Button className={styles.danger} onClick={onDelete} disabled={busy}>
            {busy ? '삭제 중…' : '프로젝트 삭제'}
          </Button>
        </>
      }
    >
      <dl className={styles.summary}>
        {rows.map(([label, value]) => (
          <div key={label} className={styles.row}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className={styles.noticeWarn}>
        {target.archived
          ? target.memberCount > 1
            ? '완료한 프로젝트가 아카이브에서 사라지고, 다른 팀원들에게 프로젝트 삭제 알림이 가요.'
            : '완료한 프로젝트가 아카이브에서 사라져요.'
          : target.memberCount > 1
            ? '모집글이 목록에서 사라지고, 다른 팀원들에게 프로젝트 삭제 알림이 가요.'
            : '모집글이 목록에서 사라지고, 이 프로젝트로 다시 지원받을 수 없어요.'}
      </p>
    </Modal>
  );
}
