// src/pages/inbox/InboxDetail.tsx
import { useState } from 'react';
import { Copy } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Pill, Tag } from '../../components/ui/Label';
import { Textarea } from '../../components/ui/Input';
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
  saved: boolean;
  onToggleSave: () => void;
  onAccept: (reply: string) => void;
  onReject: (reply: string) => void;
  onCancel: () => void;
  onViewProject: () => void;
}

export function InboxDetail({
  item,
  saved,
  onToggleSave,
  onAccept,
  onReject,
  onCancel,
  onViewProject,
}: InboxDetailProps) {
  const toast = useToast();
  const [reply, setReply] = useState('');

  const isPending = item.status === 'pending';
  const canRespond = isPending && item.direction === 'received';
  const canCancel = isPending && item.direction === 'sent';

  const copyContact = async () => {
    if (!item.contact) return;
    try {
      await navigator.clipboard.writeText(item.contact.value);
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
              <Button
                variant={saved ? 'saved' : 'ghost'}
                size="sm"
                onClick={onToggleSave}
                aria-pressed={saved}
              >
                {saved ? '★ 저장됨' : '☆ 저장'}
              </Button>
            </div>
            <p className={styles.blockText}>
              {item.counterpart.major} | {skillSummary(item.counterpart)}
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
      {item.status === 'accepted' && item.contact && (
        <div className={styles.contact}>
          <div>
            <strong>연락처가 공개됐어요</strong>
            <p>
              {item.contact.type} · {item.contact.value}
            </p>
          </div>
          <Button variant="ghost" size="sm" icon={<Copy />} onClick={copyContact}>
            복사
          </Button>
        </div>
      )}

      {/* ---------- 메시지 ---------- */}
      <div className={styles.messageGroup}>
        <h3 className={styles.label}>{messageLabel(item)}</h3>
        <p className={styles.bubble}>{item.message}</p>
      </div>

      {/* ---------- 답장 (있을 때만) ---------- */}
      {item.reply && (
        <div className={styles.messageGroup}>
          <h3 className={styles.label}>{replyLabel(item)}</h3>
          <p className={styles.bubble}>{item.reply}</p>
        </div>
      )}

      {/* ---------- 답장 입력 (받은 내역 + 대기 중) ---------- */}
      {canRespond && (
        <div className={styles.messageGroup}>
          <label className={styles.label} htmlFor="reply">
            답장 <span className={styles.optional}>선택</span>
          </label>
          <Textarea
            id="reply"
            placeholder="예: 제안 감사해요! 함께하고 싶어요."
            value={reply}
            maxLength={300}
            onChange={(e) => setReply(e.target.value)}
            style={{ minHeight: 66 }}
          />
        </div>
      )}

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
            <Button variant="ghost" onClick={onCancel}>
              {item.kind === 'offer' ? '제안 취소하기' : '지원 취소하기'}
            </Button>
          )}
          {canRespond && (
            <>
              <Button variant="ghost" onClick={() => onReject(reply.trim())}>
                거절
              </Button>
              <Button onClick={() => onAccept(reply.trim())}>수락</Button>
            </>
          )}
        </div>
      )}
    </section>
  );
}