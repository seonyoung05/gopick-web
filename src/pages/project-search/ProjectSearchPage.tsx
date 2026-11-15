// src/pages/project-search/ProjectSearchPage.tsx
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FilterPanel, createFilterValues, type FilterValues } from '../../components/common/FilterPanel';
import { useToast } from '../../components/common/Toast';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Segment } from '../../components/ui/Segment';
import { PROJECT_FILTERS } from '../../constants/filters';
import { recruitProjects, ongoingProjects, doneProjects } from '../../mocks/projects';
import type { RecruitProject, TeamProject } from '../../types/project';
import { ApplyModal, type ApplyPayload } from '../projects/ApplyModal';
import { ProjectListItem } from '../projects/ProjectListItem';
import { RecruitCard } from '../projects/RecruitCard';
import {
  SORT_OPTIONS,
  filterRecruit,
  filterTeams,
  sortRecruit,
  sortTeams,
  type SortOption,
} from './filterProjects';
import styles from './ProjectSearchPage.module.css';

/** "내 프로필로 채우기"에 쓰는 임시 값. TODO: 내 프로필(API)에서 역할·기술·관심 분야를 가져오기 */
const MY_PROFILE_FILTERS: Partial<FilterValues> = {
  roles: ['Backend'],
  stacks: ['Python', 'Java'],
  fields: ['AI', '웹'],
};

const toggleScrap = <T extends { id: string; scrapped: boolean }>(list: T[], id: string): T[] =>
  list.map((p) => (p.id === id ? { ...p, scrapped: !p.scrapped } : p));

export default function ProjectSearchPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [keyword, setKeyword] = useState('');
  const [filters, setFilters] = useState<FilterValues>(() => createFilterValues(PROJECT_FILTERS));
  const [sort, setSort] = useState<SortOption>('최근 활동순');

  const [recruit, setRecruit] = useState<RecruitProject[]>(recruitProjects);
  const [ongoing, setOngoing] = useState<TeamProject[]>(ongoingProjects);
  const [done, setDone] = useState<TeamProject[]>(doneProjects);

  /** 지금 지원 모달을 열어 둔 프로젝트 (null이면 닫힘) */
  const [applyTarget, setApplyTarget] = useState<RecruitProject | null>(null);
  /** 지원을 보낸 프로젝트 ID */
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  // 상태를 하나도 안 고르면 전부 보여줘요
  const statuses = filters.status ?? [];
  const showAll = statuses.length === 0;
  const showRecruit = showAll || statuses.includes('모집 중');
  const showOngoing = showAll || statuses.includes('진행 중');
  const showDone = showAll || statuses.includes('완료');

  const recruitResults = useMemo(
    () => (showRecruit ? sortRecruit(filterRecruit(recruit, filters, keyword), sort) : []),
    [showRecruit, recruit, filters, keyword, sort],
  );
  const ongoingResults = useMemo(
    () => (showOngoing ? sortTeams(filterTeams(ongoing, keyword)) : []),
    [showOngoing, ongoing, keyword],
  );
  const doneResults = useMemo(
    () => (showDone ? sortTeams(filterTeams(done, keyword)) : []),
    [showDone, done, keyword],
  );
  const total = recruitResults.length + ongoingResults.length + doneResults.length;

  const resetAll = () => {
    setKeyword('');
    setFilters(createFilterValues(PROJECT_FILTERS));
  };

  const fillFromMyProfile = () => setFilters((prev) => ({ ...prev, ...MY_PROFILE_FILTERS }));

  const handleApply = (payload: ApplyPayload) => {
    // TODO: API 연결 시 participationApi로 지원 요청 보내기
    console.log('프로젝트 지원', payload);
    setAppliedIds((prev) => new Set(prev).add(payload.projectId));
    setApplyTarget(null);
    toast('지원을 보냈어요', 'success');
  };

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className="t-h1">검색</h1>
        <p>함께할 팀원을 찾는다면 사람을, 참여할 프로젝트를 찾는다면 프로젝트를 검색해 보세요.</p>
      </div>

      <div className={styles.top}>
        <Segment
          size="lg"
          options={['사람', '프로젝트']}
          value="프로젝트"
          onChange={(v) => {
            if (v === '사람') navigate('/search');
          }}
          aria-label="검색 대상"
        />
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} aria-hidden="true" />
          <Input
            className={styles.searchInput}
            type="search"
            placeholder="프로젝트명, 설명으로 프로젝트 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            aria-label="프로젝트 검색"
          />
        </div>
      </div>

      <div className={styles.layout}>
        <FilterPanel
          groups={PROJECT_FILTERS}
          values={filters}
          onChange={setFilters}
          extraAction={
            <Button variant="ghost" size="sm" block onClick={fillFromMyProfile}>
              내 프로필로 채우기
            </Button>
          }
        />

        <section className={styles.results} aria-label="검색 결과">
          <div className={styles.resultHead}>
            <span>
              프로젝트 <strong>{total}개</strong> | 역할·기술·목적·규모 필터는 모집 중 프로젝트에만 적용돼요
            </span>
            <Select
              className={styles.sort}
              options={SORT_OPTIONS}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              aria-label="정렬"
            />
          </div>

          {total === 0 ? (
            <div className={styles.empty}>
              <strong>조건에 맞는 프로젝트가 없어요</strong>
              검색어를 바꾸거나 필터를 줄여 보세요.
              <div style={{ marginTop: 16 }}>
                <Button variant="ghost" size="sm" onClick={resetAll}>
                  검색 조건 초기화
                </Button>
              </div>
            </div>
          ) : (
            <>
              {recruitResults.map((p) => (
                <RecruitCard
                  key={p.id}
                  project={p}
                  applied={appliedIds.has(p.id)}
                  onToggleScrap={() => setRecruit((prev) => toggleScrap(prev, p.id))}
                  onApply={() => setApplyTarget(p)}
                />
              ))}

              {ongoingResults.length > 0 && (
                <>
                  <h2 className={styles.sectionTitle}>진행 중 {ongoingResults.length}</h2>
                  <div className={styles.teamList}>
                    {ongoingResults.map((p) => (
                      <ProjectListItem
                        key={p.id}
                        project={p}
                        selected={false}
                        onSelect={() => navigate('/projects?tab=ongoing')}
                        onToggleScrap={() => setOngoing((prev) => toggleScrap(prev, p.id))}
                      />
                    ))}
                  </div>
                </>
              )}

              {doneResults.length > 0 && (
                <>
                  <h2 className={styles.sectionTitle}>완료 {doneResults.length}</h2>
                  <div className={styles.teamList}>
                    {doneResults.map((p) => (
                      <ProjectListItem
                        key={p.id}
                        project={p}
                        selected={false}
                        onSelect={() => navigate('/projects?tab=done')}
                        onToggleScrap={() => setDone((prev) => toggleScrap(prev, p.id))}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </section>
      </div>

      <ApplyModal project={applyTarget} onClose={() => setApplyTarget(null)} onSubmit={handleApply} />
    </div>
  );
}
