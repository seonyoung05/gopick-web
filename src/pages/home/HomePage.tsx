// src/pages/home/HomePage.tsx
import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { MOCK_PARTICIPATIONS } from '../../mocks/participations';
import { doneProjects, ongoingProjects, recruitProjects } from '../../mocks/projects';
import type { RecruitProject, TeamProject } from '../../types/project';
import { ArchiveMiniCard, OngoingMiniCard, RecruitMiniCard } from './HomeCards';
import styles from './HomePage.module.css';

/** 홈에는 각 구역에 최근 활동 프로젝트만 보여줘요 */
const RECRUIT_LIMIT = 3;
const ONGOING_LIMIT = 3;
const DONE_LIMIT = 2;

const toggleScrap = <T extends { id: string; scrapped: boolean }>(list: T[], id: string): T[] =>
  list.map((p) => (p.id === id ? { ...p, scrapped: !p.scrapped } : p));

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

  const [recruit, setRecruit] = useState<RecruitProject[]>(() => recruitProjects.slice(0, RECRUIT_LIMIT));
  const [ongoing, setOngoing] = useState<TeamProject[]>(() => ongoingProjects.slice(0, ONGOING_LIMIT));
  const [done, setDone] = useState<TeamProject[]>(() => doneProjects.slice(0, DONE_LIMIT));

  // 아직 열어 보지 않은 받은 제안 · 내 프로젝트에 들어온 지원
  const unread = MOCK_PARTICIPATIONS.filter((p) => p.direction === 'received' && !p.read);
  const offerCount = unread.filter((p) => p.kind === 'offer').length;
  const applyCount = unread.filter((p) => p.kind === 'apply').length;
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
            <Button onClick={() => navigate('/manage')}>프로젝트 모집 등록</Button>
            <Button variant="ghost" onClick={() => navigate('/profile')}>
              내 프로필 작성
            </Button>
          </div>
        </div>
      </section>

      <Section title="팀원 모집 중인 프로젝트" to="/projects?tab=recruit">
        <div className={styles.grid3}>
          {recruit.map((p) => (
            <RecruitMiniCard
              key={p.id}
              project={p}
              onToggleScrap={() => setRecruit((prev) => toggleScrap(prev, p.id))}
              onDetail={() => navigate('/projects?tab=recruit')}
              // TODO: 지원 모달(M2)이 병합되면 모달로 연결
              onApply={() => navigate('/projects?tab=recruit')}
              onEdit={() => navigate('/manage')}
              onRecommend={() => navigate('/recommend')}
              onStart={() => navigate('/projects?tab=recruit')}
              onOffers={() => navigate('/offers')}
            />
          ))}
        </div>
      </Section>

      <Section title="진행 중인 프로젝트" to="/projects?tab=ongoing">
        <div className={styles.grid3}>
          {ongoing.map((p) => (
            <OngoingMiniCard
              key={p.id}
              project={p}
              onToggleScrap={() => setOngoing((prev) => toggleScrap(prev, p.id))}
              onView={() => navigate('/projects?tab=ongoing')}
            />
          ))}
        </div>
      </Section>

      <Section title="완료 프로젝트 아카이브" to="/projects?tab=done">
        <div className={styles.grid2}>
          {done.map((p) => (
            <ArchiveMiniCard
              key={p.id}
              project={p}
              onToggleScrap={() => setDone((prev) => toggleScrap(prev, p.id))}
              onView={() => navigate('/projects?tab=done')}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}
