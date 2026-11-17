// src/pages/projects/RecruitDetailModal.tsx
import { Calendar, Check, Sparkles, User, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/ui/Button';
import { Status, Tag } from '../../components/ui/Label';
import { parseRecruitPost } from '../../stores/recruitPost';
import type { RecruitProject } from '../../types/project';
import styles from './RecruitDetailModal.module.css';

interface RecruitDetailModalProps {
  /** 보여 줄 모집글 (null이면 닫힘) */
  project: RecruitProject | null;
  /** 이미 지원을 보낸 프로젝트인지 */
  applied?: boolean;
  onClose: () => void;
  /** 모달 안의 "지원하기" 클릭 */
  onApply: (project: RecruitProject) => void;
}

/** "이런 분과 함께하고 싶어요" 처럼 목록으로 보여줄 단락인지 */
const isChecklist = (heading: string) => heading.includes('함께하고');

/** 소제목 없이 본문만 보여줄 단락 */
const HIDDEN_HEADINGS = ['프로젝트 추진 배경', '구체적인 목표'];

/** 줄마다 앞의 "-", "•" 를 떼어낸 목록 */
const toItems = (body: string) =>
  body
    .split('\n')
    .map((line) => line.replace(/^[-•·*]\s*/, '').trim())
    .filter(Boolean);

/** 모집글 보기 모달: 카드에는 다 못 담은 모집글 전체를 보여줘요 */
export function RecruitDetailModal({ project, applied = false, onClose, onApply }: RecruitDetailModalProps) {
  const canApply = project?.action === 'apply';

  return (
    <Modal
      open={project !== null}
      onClose={onClose}
      size="lg"
      header={project && <Header project={project} />}
      footer={
        project && (
          <>
            <Button variant="ghost" onClick={onClose}>
              닫기
            </Button>
            {canApply &&
              (applied ? (
                <Button disabled>지원 보냄</Button>
              ) : (
                <Button onClick={() => onApply(project)}>지원하기</Button>
              ))}
          </>
        )
      }
    >
      {project && <Body project={project} />}
    </Modal>
  );
}

function Header({ project: p }: { project: RecruitProject }) {
  return (
    <div>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>{p.title}</h2>
        <Status status="recruit" />
      </div>
      <p className={styles.meta}>
        {p.author} 님이 {p.date}에 등록 · 최근 활동 {p.lastActive}
      </p>
    </div>
  );
}

function Body({ project: p }: { project: RecruitProject }) {
  const post = p.post ? parseRecruitPost(p.post) : null;

  // 인원: 남은 모집 인원은 역할별 모집 수의 합
  const remaining = p.roles.reduce((sum, r) => sum + r.count, 0);
  const total = p.current + remaining;
  const percent = total > 0 ? Math.min(100, Math.round((p.current / total) * 100)) : 0;

  const infos: { icon: ReactNode; label: string; value?: string }[] = [
    { icon: <Calendar size={18} aria-hidden="true" />, label: '모임', value: p.extra },
    { icon: <Users size={18} aria-hidden="true" />, label: '함께하고 싶은 팀원', value: p.wish },
    { icon: <User size={18} aria-hidden="true" />, label: '현재 팀', value: p.team },
  ];
  const shownInfos = infos.filter((i) => i.value);

  return (
    <div className={styles.body}>
      <div className={styles.headcount}>
        <span className={styles.headcountNow}>
          <small>현재</small> <strong>{p.current}명</strong> <span>/ 목표 {p.target}명</span>
        </span>
        <div
          className={styles.bar}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={p.current}
          aria-label="모집 진행"
        >
          <div className={styles.barFill} style={{ width: `${percent}%` }} />
        </div>
        {remaining > 0 && <span className={styles.headcountLeft}>{remaining}명 더 모집 중</span>}
      </div>

      {post ? (
        <section className={styles.post} aria-label="모집글">
          <div className={styles.postHead}>
            <h3 className={styles.sectionTitle}>모집글</h3>
            <span className={styles.aiBadge}>
              <Sparkles size={12} aria-hidden="true" /> 작성자 입력을 AI가 정리했어요
            </span>
          </div>
          <p className={styles.postTitle}>{post.title}</p>
          {post.summary && <p className={styles.postSummary}>{post.summary}</p>}
          {post.sections.map((s) => (
            <div key={s.heading} className={styles.postSection}>
              {!HIDDEN_HEADINGS.includes(s.heading) && <h4 className={styles.postHeading}>{s.heading}</h4>}
              {isChecklist(s.heading) ? (
                <ul className={styles.checklist}>
                  {toItems(s.body).map((item) => (
                    <li key={item}>
                      <Check size={16} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.postText}>{s.body}</p>
              )}
            </div>
          ))}
        </section>
      ) : (
        p.description && <p className={styles.plainDesc}>{p.description}</p>
      )}

      <section>
        <h3 className={styles.sectionTitle}>모집 역할</h3>
        <ul className={styles.roles}>
          {p.roles.map((r) => (
            <li key={r.role}>
              <span>
                <strong>{r.role}</strong> <em>{r.count}명</em>
              </span>
              <span className={styles.skill}>{r.skill}</span>
            </li>
          ))}
        </ul>
      </section>

      {shownInfos.length > 0 && (
        <section>
          <h3 className={styles.sectionTitle}>상세 안내</h3>
          <div className={styles.infoGrid}>
            {shownInfos.map((i) => (
              <div key={i.label} className={styles.info}>
                <span className={styles.infoIcon}>{i.icon}</span>
                <span className={styles.infoLabel}>{i.label}</span>
                <strong className={styles.infoValue}>{i.value}</strong>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className={styles.tags}>
        {p.fields.map((t) => (
          <Tag key={t} tone="gray">{t}</Tag>
        ))}
        {p.purposes.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>
    </div>
  );
}
