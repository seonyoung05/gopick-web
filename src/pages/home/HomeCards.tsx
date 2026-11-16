// src/pages/home/HomeCards.tsx
// 홈 화면에 쓰는 간단한 프로젝트 카드 3종 (모집 중 / 진행 중 / 완료)
import { Button } from '../../components/ui/Button';
import { MineLabel, Status, Tag } from '../../components/ui/Label';
import type { RecruitProject, TeamProject } from '../../types/project';
import { ScrapButton } from '../projects/ScrapButton';
import { StageDots } from '../projects/StageTracker';
import styles from './HomeCards.module.css';

interface RecruitMiniCardProps {
  project: RecruitProject;
  /** 이미 지원하고 답을 기다리는 중 */
  applied?: boolean;
  onToggleScrap: () => void;
  onDetail: () => void;
  onApply: () => void;
  onEdit: () => void;
  onRecommend: () => void;
  onStart: () => void;
  onOffers: () => void;
}

/** 팀원 모집 중인 프로젝트 카드 */
export function RecruitMiniCard({
  project: p,
  applied = false,
  onToggleScrap,
  onDetail,
  onApply,
  onEdit,
  onRecommend,
  onStart,
  onOffers,
}: RecruitMiniCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <Status status="recruit" />
        <div className={styles.topRight}>
          {p.action === 'mine' && <MineLabel />}
          <ScrapButton iconOnly scrapped={p.scrapped} onToggle={onToggleScrap} />
        </div>
      </div>

      <h3 className={`t-h3 ${styles.title}`}>{p.title}</h3>
      <p className={styles.desc}>{p.description}</p>

      <div className={styles.tags}>
        {p.roles.map((r) => (
          <Tag key={r.role}>
            {r.role} {r.count}명
          </Tag>
        ))}
      </div>

      <div className={styles.actions}>
        {p.action === 'mine' ? (
          <>
            <Button variant="ghost" size="sm" block onClick={onEdit}>
              수정
            </Button>
            <Button variant="ghost" size="sm" block onClick={onRecommend}>
              추천 팀원 보기
            </Button>
            <Button size="sm" block onClick={onStart}>
              모집 마치고 진행 시작
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" block onClick={onDetail}>
              자세히 보기
            </Button>
            {p.action === 'member' ? (
              <Button size="sm" block variant="ghost" disabled>
                참여 중
              </Button>
            ) : p.action === 'apply' ? (
              <Button size="sm" block onClick={onApply} disabled={applied} variant={applied ? 'ghost' : undefined}>
                {applied ? '지원 보냄' : '지원하기'}
              </Button>
            ) : (
              <Button size="sm" block onClick={onOffers}>
                받은 제안 보기
              </Button>
            )}
          </>
        )}
      </div>
    </article>
  );
}

interface TeamMiniCardProps {
  project: TeamProject;
  onToggleScrap: () => void;
  onView: () => void;
}

/** 진행 중인 프로젝트 카드: 단계 점과 "진행 현황 보기" */
export function OngoingMiniCard({ project: p, onToggleScrap, onView }: TeamMiniCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <Status status="ongoing" />
        <ScrapButton iconOnly scrapped={p.scrapped} onToggle={onToggleScrap} />
      </div>

      <h3 className={`t-h3 ${styles.title}`}>{p.title}</h3>
      <p className={styles.desc}>{p.description}</p>
      <StageDots currentStage={p.currentStage} />

      <div className={styles.actions}>
        <Button variant="ghost" size="sm" block onClick={onView}>
          진행 현황 보기
        </Button>
      </div>
    </article>
  );
}

/** 완료 프로젝트 카드: 기간·팀원 수와 산출물 태그, "아카이브 보기" */
export function ArchiveMiniCard({ project: p, onToggleScrap, onView }: TeamMiniCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <Status status="done" />
        <ScrapButton iconOnly scrapped={p.scrapped} onToggle={onToggleScrap} />
      </div>

      <h3 className={`t-h3 ${styles.title}`}>{p.title}</h3>
      <p className={styles.meta}>
        {p.period ? `${p.period}, ` : ''}팀원 {p.members.length}명
      </p>
      <p className={styles.desc}>{p.description}</p>

      {p.outputs && (
        <div className={styles.tags}>
          {p.outputs.map((o) => (
            <Tag key={o.label}>{o.label}</Tag>
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <Button variant="ghost" size="sm" block onClick={onView}>
          아카이브 보기
        </Button>
      </div>
    </article>
  );
}
