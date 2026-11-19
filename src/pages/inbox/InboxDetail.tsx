// src/pages/inbox/InboxDetail.tsx
import { Copy } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Pill, Tag } from '../../components/ui/Label';
import { FitLists } from '../../components/common/FitLists';
import { useToast } from '../../components/common/Toast';
import type { Participation } from '../../types/participation';
import { skillSummary } from '../people/filterPeople';
import {
  detailSub,
  detailTitle,
  messageLabel,
  noteText,
  replyLabel,
  showsProject,
} from './inboxText';
import styles from './InboxPage.module.css';

interface InboxDetailProps {
  item: Participation;
  /** 수락·거절·취소 요청 중 (버튼 잠금) */
  busy?: boolean;
  saved: boolean;
  onToggleSave: () => void;
  onAccept: () => void;
  onReject: () => void;
  onCancel: () => void;
  onViewProject: () => void;
  /** 상대 프로필 상세 열기 (공개 프로필만) */
  onViewProfile: () => void;
}

export function InboxDetail({
  item,
  busy = false,
  saved,
  onToggleSave,
  onAccept,
  onReject,
  onCancel,
  onViewProject,
  onViewProfile,
}: InboxDetailProps) {
  const toast = useToast();

  const isPending = item.status === 'pending';
  const canRespond = isPending && item.direction === 'received';
  const canCancel = isPending && item.direction === 'sent';

  const contacts = item.counterpart.contacts ?? [];
  const copyContact = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast('연락처를 복사했어요', 'success');
    } catch {
      toast('복사하지 못했어요. 직접 선택해서 복사해 주세요', 'error');
    }
  };

  return (
    <section className={styles.detail} aria-label="상세">
      {/* ---------- 제목 ---------- */}
      <header className={styles.detailHead}>
        <div>
          <h2 className={styles.detailTitle}>{detailTitle(item)}</h2>
          <p className={styles.detailSub}>{detailSub(item)}</p>
        </div>
        <Pill type={item.status} />
      </header>

      {/* ---------- 프로젝트 카드 또는 사람 카드 ---------- */}
      <div className={styles.block}>
        {showsProject(item) ? (
          <>
            <h3 className={styles.blockTitle}>{item.project.name}</h3>
            <p className={styles.blockText}>{item.project.description}</p>
            <div className={styles.roleRow}>
              <strong>{item.role}</strong>
              <span>{item.roleCondition}</span>
            </div>
            <p className={styles.blockMeta}>
              등록자 {item.project.ownerName} | {item.project.summary}
            </p>
          </>
        ) : (
          <>
            <div className={styles.blockHeadRow}>
              <h3 className={styles.blockTitle}>{item.counterpart.name}</h3>
              {item.counterpart.isPublic && (
                <div className={styles.headButtons}>
                  <Button variant="ghost" size="sm" onClick={onViewProfile}>
                    프로필 보기
                  </Button>
                  <Button
                    variant={saved ? 'saved' : 'ghost'}
                    size="sm"
                    onClick={onToggleSave}
                    aria-pressed={saved}
                  >
                    {saved ? '★ 저장됨' : '☆ 저장'}
                  </Button>
                </div>
              )}
            </div>
            <p className={styles.blockText}>
              {item.counterpart.isPublic
                ? `${item.counterpart.major} | ${skillSummary(item.counterpart)}`
                : '비공개 프로필이라 자세한 정보를 볼 수 없어요.'}
            </p>
            <div className={styles.tags}>
              {item.counterpart.roles.map((r) => (
                <Tag key={r}>{r}</Tag>
              ))}
            </div>
          </>
        )}
        <FitLists matched={item.matched} unmatched={item.unmatched} />
      </div>

      {/* ---------- 연락처 (수락됐을 때만) ---------- */}
      {item.status === 'accepted' && contacts.length > 0 && (
        <div className={styles.contact}>
          <strong>연락처가 공개됐어요</strong>
          {contacts.map((c) => (
            <div key={`${c.platform}-${c.value}`} className={styles.contactLine}>
              <p>
                {c.platform} · {c.value}
              </p>
              <Button
                variant="ghost"
                size="sm"
                icon={<Copy />}
                aria-label={`${c.platform} 복사`}
                onClick={() => copyContact(c.value)}
              >
                복사
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* ---------- 메시지 (서버가 메시지를 받게 되면 표시) ---------- */}
      {item.message && (
        <div className={styles.messageGroup}>
          <h3 className={styles.label}>{messageLabel(item)}</h3>
          <p className={styles.bubble}>{item.message}</p>
        </div>
      )}

      {/* ---------- 답장 (있을 때만) ---------- */}
      {item.reply && (
        <div className={styles.messageGroup}>
          <h3 className={styles.label}>{replyLabel(item)}</h3>
          <p className={styles.bubble}>{item.reply}</p>
        </div>
      )}

      {/* TODO: 서버가 답장을 받게 되면 답장 입력칸 다시 추가 */}

      <p className={styles.note}>{noteText(item)}</p>

      {/* ---------- 버튼 ---------- */}
      {(canRespond || canCancel || (item.direction === 'sent' && item.kind === 'apply')) && (
        <div className={styles.actions}>
          {item.direction === 'sent' && item.kind === 'apply' && (
            <Button variant="ghost" onClick={onViewProject}>
              프로젝트 보기
            </Button>
          )}
          {canCancel && (
            <Button variant="ghost" onClick={onCancel} disabled={busy}>
              {item.kind === 'offer' ? '제안 취소하기' : '지원 취소하기'}
            </Button>
          )}
          {canRespond && (
            <>
              <Button variant="ghost" onClick={onReject} disabled={busy}>
                거절
              </Button>
              <Button onClick={onAccept} disabled={busy}>
                수락
              </Button>
            </>
          )}
        </div>
      )}
    </section>
  );
}