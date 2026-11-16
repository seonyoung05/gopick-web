// src/pages/home/HomePage.tsx
import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useInboxSummary } from '../../hooks/useInboxSummary';
import { useProjectFeed } from '../../hooks/useProjectFeed';
import type { RecruitProject } from '../../types/project';
import { ApplyModal } from '../projects/ApplyModal';
import { ArchiveMiniCard, OngoingMiniCard, RecruitMiniCard } from './HomeCards';
import styles from './HomePage.module.css';

/** 홈에는 각 구역에 최근 활동 프로젝트만 보여줘요 */
const RECRUIT_LIMIT = 3;
const ONGOING_LIMIT = 3;
const DONE_LIMIT = 2;

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

  const feed = useProjectFeed();
  const recruit = feed.recruit.slice(0, RECRUIT_LIMIT);
  const ongoing = feed.ongoing.slice(0, ONGOING_LIMIT);
  const done = feed.done.slice(0, DONE_LIMIT);
  const [applyTarget, setApplyTarget] = useState<RecruitProject | null>(null);

  // 아직 열어 보지 않은 받은 제안 · 내 프로젝트에 들어온 지원
  const { receivedOffers: offerCount, receivedApplies: applyCount } = useInboxSummary();

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
  const news = [
    offerCount > 0 && `받은 참여 제안 ${offerCount}건`,
    applyCount > 0 && `내 프로젝트 지원 ${applyCount}건`,
  ].filter(Boolean);

  return (
    <div className={styles.page}>
      {news.length > 0 && (
        <div className={styles.notice}>
          <p>
            <strong>새 소식</strong> {news.join(', ')}이 있어요.
          </p>
          <Button size="sm" onClick={() => navigate('/offers')}>
            확인하기
          </Button>
        </div>
      )}

      <section className={styles.hero} aria-label="GoPick 소개">
        <div className={styles.stripe} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className={styles.heroBody}>
          <h1 className="t-display">
            기술, 관심사, 경험으로
            <br />
            함께할 팀원을 찾아보세요
          </h1>
          <p className={styles.heroDesc}>
            GoPick은 GDGoC 구성원의 프로필을 바탕으로 프로젝트에 맞는 팀원을 탐색·추천하고, 팀이 꾸려진 뒤에는
            진행 상황까지 한곳에서 보여줍니다.
          </p>
          <div className={styles.cta}>
            <Button onClick={() => navigate('/manage?id=new')}>프로젝트 모집 등록</Button>
            <Button variant="ghost" onClick={() => navigate('/profile')}>
              내 프로필 작성
            </Button>
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
              onToggleScrap={() => feed.toggleScrap(p.id)}
              onDetail={() => navigate('/projects?tab=recruit')}
              onApply={() => setApplyTarget(p)}
              onEdit={() => navigate(`/manage?id=${p.id}`)}
              onRecommend={() => navigate('/recommend')}
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
              onToggleScrap={() => feed.toggleScrap(p.id)}
              onView={() => navigate('/projects?tab=ongoing')}
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
              onToggleScrap={() => feed.toggleScrap(p.id)}
              onView={() => navigate('/projects?tab=done')}
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
