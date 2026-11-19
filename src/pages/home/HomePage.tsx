// src/pages/home/HomePage.tsx
import { useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useProfileGate } from '../../components/common/ProfileGate';
import { useProjectFeed } from '../../hooks/useProjectFeed';
import type { RecruitProject } from '../../types/project';
import { ApplyModal } from '../projects/ApplyModal';
import { ArchiveMiniCard, OngoingMiniCard, RecruitMiniCard } from './HomeCards';
import styles from './HomePage.module.css';

/** 홈에는 각 구역에 최근 활동 프로젝트만 보여줘요 */
const RECRUIT_LIMIT = 3;
const ONGOING_LIMIT = 3;
const DONE_LIMIT = 2;

/** 히어로 오른쪽 칩: 위치는 물결 원(320×320 기준) 안의 비율이에요 */
const ORBIT_CHIPS: { label: string; color: string; style: CSSProperties & { '--i': number } }[] = [
  { label: 'UI/UX', color: 'var(--blue)', style: { left: '13%', top: '11%', '--i': 0 } },
  { label: 'Python', color: 'var(--red)', style: { left: '56%', top: '26%', '--i': 1 } },
  { label: 'GeoAI', color: 'var(--yellow)', style: { left: '4%', top: '44%', '--i': 2 } },
  { label: 'Backend', color: 'var(--green)', style: { left: '57%', top: '62%', '--i': 3 } },
  { label: '스터디 매칭', color: 'var(--blue)', style: { left: '22%', top: '80%', '--i': 4 } },
];

function Section({ title, to, children }: { title: string; to: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className="t-h2">{title}</h2>
        <Link to={to} className={styles.more}>
          전체 보기
        </Link>
      </div>
      {children}
    </section>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  // 프로필이 없으면 목록 구경만 (지원·자세히 보기·스크랩·등록은 안내 모달)
  const { hasProfile, requireProfile } = useProfileGate();

  const feed = useProjectFeed();
  const recruit = feed.recruit.slice(0, RECRUIT_LIMIT);
  const ongoing = feed.ongoing.slice(0, ONGOING_LIMIT);
  const done = feed.done.slice(0, DONE_LIMIT);
  const [applyTarget, setApplyTarget] = useState<RecruitProject | null>(null);

  /** 구역이 비었거나 불러오는 중일 때 */
  const emptyText = (text: string) => (
    <p className={styles.emptySection}>
      {feed.status === 'loading'
        ? '불러오는 중이에요…'
        : feed.status === 'error'
          ? '프로젝트를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'
          : text}
    </p>
  );
  /** 프로필이 있을 때만 실행 */
  const gated = (action: string, run: () => void) => () => {
    if (requireProfile(action)) run();
  };

  return (
    <div className={styles.page}>
      {/* 프로필이 없는 계정: 프로필을 만들도록 안내 (만들면 사라져요) */}
      {!hasProfile && (
        <div className={styles.notice}>
          <span className={styles.noticeIcon} aria-hidden="true">
            <UserRound size={20} />
          </span>
          <p>
            <strong>프로필을 만들면 팀원 추천과 지원을 할 수 있어요</strong>
            <span>기술·관심사·경험을 적어 두면 나에게 맞는 프로젝트와 팀원을 찾아드려요.</span>
          </p>
          <Button size="sm" onClick={() => navigate('/profile')}>
            프로필 만들기
          </Button>
        </div>
      )}

      <section className={styles.hero} aria-label="GoPick 소개">
        <div className={styles.stage}>
          <div className={styles.stripe} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className={styles.heroBody}>
            <h1 className={styles.heroTitle}>
              <mark className={`${styles.hl} ${styles.hlBlue}`}>기술</mark>,{' '}
              <mark className={`${styles.hl} ${styles.hlRed}`}>관심사</mark>,{' '}
              <mark className={`${styles.hl} ${styles.hlYellow}`}>경험</mark>으로
              <br />
              함께할 <span className={styles.flow}>팀원</span>을 찾아보세요
            </h1>
            <p className={styles.heroDesc}>
              GoPick은 GDGoC 구성원의 프로필을 바탕으로 프로젝트에 맞는 팀원을 탐색·추천하고,{' '}
              <br className={styles.descBreak} />팀이 꾸려진 뒤에는 진행 상황까지 한곳에서 보여줍니다.
            </p>
            <div className={styles.cta}>
              <Button onClick={gated('프로젝트를 등록하려면', () => navigate('/manage?id=new'))}>
                프로젝트 모집 등록
              </Button>
              <Button variant="ghost" onClick={() => navigate('/profile')}>
                내 프로필 작성
              </Button>
            </div>
          </div>

          {/* 팀원과 기술이 모이는 장면 (꾸미기용이라 화면 읽기에서는 빼요) */}
          <div className={styles.orbit} aria-hidden="true">
            <svg className={styles.rings} viewBox="0 0 320 320">
              <circle className={styles.ringOuter} cx="160" cy="160" r="158" />
              <circle className={styles.ringInner} cx="160" cy="160" r="106" />
              <circle className={styles.core} cx="160" cy="160" r="5.5" />
            </svg>
            {ORBIT_CHIPS.map((c) => (
              <span key={c.label} className={styles.chip} style={c.style}>
                <span className={styles.chipBody}>
                  <i className={styles.chipDot} style={{ background: c.color }} />
                  {c.label}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <Section title="팀원 모집 중인 프로젝트" to="/projects?tab=recruit">
        {recruit.length === 0 && emptyText('지금 모집 중인 프로젝트가 없어요. 직접 등록해 팀원을 모아 보세요.')}
        <div className={styles.grid3}>
          {recruit.map((p) => (
            <RecruitMiniCard
              key={p.id}
              project={p}
              applied={feed.appliedIds.has(p.id)}
              onToggleScrap={gated('스크랩하려면', () => feed.toggleScrap(p.id))}
              onDetail={gated('자세히 보려면', () => navigate(`/projects?tab=recruit&project=${p.id}`))}
              onApply={gated('지원하려면', () => setApplyTarget(p))}
              onEdit={() => navigate(`/manage?id=${p.id}`)}
              onRecommend={() => navigate(`/recommend?projectId=${p.id}`)}
              onStart={() => navigate('/projects?tab=recruit')}
              onOffers={() => navigate('/offers')}
            />
          ))}
        </div>
      </Section>

      <Section title="진행 중인 프로젝트" to="/projects?tab=ongoing">
        {ongoing.length === 0 && emptyText('아직 진행 중인 프로젝트가 없어요.')}
        <div className={styles.grid3}>
          {ongoing.map((p) => (
            <OngoingMiniCard
              key={p.id}
              project={p}
              onToggleScrap={gated('스크랩하려면', () => feed.toggleScrap(p.id))}
              onView={gated('자세히 보려면', () => navigate(`/projects?tab=ongoing&project=${p.id}`))}
            />
          ))}
        </div>
      </Section>

      <Section title="완료 프로젝트 아카이브" to="/projects?tab=done">
        {done.length === 0 && emptyText('아직 완료한 프로젝트가 없어요.')}
        <div className={styles.grid2}>
          {done.map((p) => (
            <ArchiveMiniCard
              key={p.id}
              project={p}
              onToggleScrap={gated('스크랩하려면', () => feed.toggleScrap(p.id))}
              onView={gated('자세히 보려면', () => navigate(`/projects?tab=done&project=${p.id}`))}
            />
          ))}
        </div>
      </Section>

      <ApplyModal
        project={applyTarget}
        onClose={() => setApplyTarget(null)}
        onSubmit={async (payload) => {
          if (await feed.apply(payload)) setApplyTarget(null);
        }}
      />
    </div>
  );
}
