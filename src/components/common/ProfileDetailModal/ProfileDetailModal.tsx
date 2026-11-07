// src/components/common/ProfileDetailModal/ProfileDetailModal.tsx
import { Modal } from '../Modal';
import { Avatar } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import { Tag } from '../../ui/Label';
import type { PersonSummary } from '../../../types/person';
import styles from './ProfileDetailModal.module.css';

interface ProfileDetailModalProps {
  person: PersonSummary | null;
  onClose: () => void;
  saved: boolean;
  onToggleSave: () => void;
  /** 없으면 제안 버튼을 숨김 (예: 이미 제안을 보낸 사람) */
  onOffer?: () => void;
}

/** 값이 없으면 회색 "입력하지 않음" */
function Value({ children }: { children?: string }) {
  return children ? <>{children}</> : <span className={styles.muted}>입력하지 않음</span>;
}

export function ProfileDetailModal({ person, onClose, saved, onToggleSave, onOffer }: ProfileDetailModalProps) {
  return (
    <Modal
      open={person !== null}
      onClose={onClose}
      size="lg"
      header={
        person && (
          <div className={styles.header}>
            <Avatar name={person.name} seed={person.id} size="lg" />
            <div>
              <h2 id="modal-title" className={styles.name}>{person.name}</h2>
              <p className={styles.major}>{person.major}</p>
              <div className={styles.tags}>
                {person.roles.map((r) => (
                  <Tag key={r}>희망 {r}</Tag>
                ))}
                {person.teamTendency && <Tag tone="gray">{person.teamTendency} 성향</Tag>}
              </div>
            </div>
          </div>
        )
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>닫기</Button>
          <Button variant={saved ? 'saved' : 'ghost'} onClick={onToggleSave} aria-pressed={saved}>
            {saved ? '★ 저장됨' : '☆ 저장'}
          </Button>
          {onOffer && <Button onClick={onOffer}>참여 제안 보내기</Button>}
        </>
      }
    >
      {person && (
        <dl className={styles.list}>
          <dt>기술 스택</dt>
          <dd>
            {person.skills.length ? (
              person.skills.map((s) => (
                <Tag key={s.stack} tone="gray">{s.stack} · {s.level}</Tag>
              ))
            ) : (
              <Value />
            )}
          </dd>

          <dt>관심 분야</dt>
          <dd><Value>{person.fields.join(', ')}</Value></dd>

          <dt>프로젝트 경험</dt>
          <dd><Value>{person.experiences?.join(' / ')}</Value></dd>

          <dt>협업 성향</dt>
          <dd><Value>{person.collab.join(', ')}</Value></dd>

          <dt>프로젝트 성향</dt>
          <dd><Value>{person.tendencies.join(', ')}</Value></dd>

          <dt>소개</dt>
          <dd><Value>{person.intro}</Value></dd>

          <dt>연락처</dt>
          <dd className={styles.muted}>제안·지원이 수락되면 서로 공개돼요</dd>
        </dl>
      )}
    </Modal>
  );
}