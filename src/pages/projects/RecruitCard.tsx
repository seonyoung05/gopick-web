// src/pages/projects/RecruitCard.tsx
import { useId, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Status, Tag, MineLabel } from '../../components/ui/Label';
import type { RecruitProject } from '../../types/project';
import { ScrapButton } from './ScrapButton';
import styles from './RecruitCard.module.css';

interface RecruitCardProps {
  project: RecruitProject;
  onToggleScrap: () => void;
  /** 지원하기 클릭 (지원 모달은 공통 Modal 병합 후 연결) */
  onApply: () => void;
  /** 내 프로젝트일 때: 수정 / 추천 팀원 보기 / 모집 마치고 진행 시작 */
  onEdit?: () => void;
  onRecommend?: () => void;
  onStart?: () => void;
}

type ActionsProps = Pick<RecruitCardProps, 'onApply' | 'onEdit' | 'onRecommend' | 'onStart'> & {
  action: RecruitProject['action'];
};

function Actions({ action, onApply, onEdit, onRecommend, onStart }: ActionsProps) {
  if (action === 'apply') {
    return (
      <Button size="sm" onClick={onApply}>
        지원하기
      </Button>
    );
  }
  if (action === 'mine') {
    return (
      <>
        <Button size="sm" variant="ghost" onClick={onEdit}>수정</Button>
        <Button size="sm" variant="ghost" onClick={onRecommend}>추천 팀원 보기</Button>
        <Button size="sm" onClick={onStart}>모집 마치고 진행 시작</Button>
      </>
    );
  }
  return <Button size="sm">받은 제안 보기</Button>;
}

export function RecruitCard({ project: p, onToggleScrap, ...actions }: RecruitCardProps) {
  const [open, setOpen] = useState(false);
  const detailId = useId();

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <Status status="recruit" />
        <div className={styles.topRight}>
          {p.action === 'mine' && <MineLabel />}
          <ScrapButton scrapped={p.scrapped} onToggle={onToggleScrap} />
        </div>
      </div>

      <h3 className={`t-h3 ${styles.title}`}>{p.title}</h3>
      <p className={styles.meta}>
        {p.author} 님이 {p.date}에 등록 | 현재 {p.current}명, 목표 {p.target}명 | 최근 활동 {p.lastActive}
      </p>
      <p className={styles.desc}>{p.description}</p>

      <ul className={styles.roles}>
        {p.roles.map((r) => (
          <li key={r.role}>
            <strong>
              {r.role} {r.count}명
            </strong>
            <span>{r.skill}</span>
          </li>
        ))}
      </ul>

      <div className={styles.tags}>
        {p.fields.map((t) => (
          <Tag key={t} tone="gray">{t}</Tag>
        ))}
        {p.purposes.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>

      <button
        type="button"
        className={styles.more}
        aria-expanded={open}
        aria-controls={detailId}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        자세히 보기
      </button>
      {open && (
        <div id={detailId} className={styles.details}>
          {p.details.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <Actions action={p.action} {...actions} />
      </div>
    </article>
  );
}
