// src/pages/project-search/filterProjects.ts
import type { FilterValues } from '../../components/common/FilterPanel';
import type { RecruitProject, TeamProject } from '../../types/project';

/** 고른 값이 없으면 통과, 있으면 하나라도 겹쳐야 통과 */
const matchesAny = (selected: string[] = [], owned: string[]) =>
  selected.length === 0 || selected.some((v) => owned.includes(v));

/** 목표 인원 "4" 또는 "4~5" → [최소, 최대] */
function parseTarget(target: string): [number, number] {
  const [min, max] = target.split('~').map(Number);
  return [min, max ?? min];
}

/** 목표 팀 규모: "6명 이상"은 최대 인원이 6 이상이면, 나머지는 범위 안에 들어오면 통과 */
function matchesTeamSize(selected: string[] = [], target: string) {
  if (selected.length === 0) return true;
  const [min, max] = parseTarget(target);
  return selected.some((label) => {
    const n = parseInt(label, 10);
    return label.includes('이상') ? max >= n : n >= min && n <= max;
  });
}

/**
 * 기술 조건: "React 우대", "Python 필수" 같은 문구에 고른 기술이 들어 있으면 통과.
 * '스택 무관'인 역할은 어떤 기술을 골라도 지원할 수 있으니 함께 보여줘요.
 */
function matchesStack(selected: string[] = [], project: RecruitProject) {
  if (selected.length === 0) return true;
  return project.roles.some(
    (r) => r.skill.includes('스택 무관') || selected.some((stack) => r.skill.includes(stack)),
  );
}

const hasKeyword = (q: string, ...texts: string[]) => !q || texts.some((t) => t.toLowerCase().includes(q));

/** 모집 중 프로젝트: 검색어 + 역할·기술·분야·목적·규모 필터 */
export function filterRecruit(projects: RecruitProject[], filters: FilterValues, keyword: string) {
  const q = keyword.trim().toLowerCase();
  return projects.filter((p) => {
    if (!hasKeyword(q, p.title, p.description)) return false;
    if (!matchesAny(filters.roles, p.roles.map((r) => r.role))) return false;
    if (!matchesStack(filters.stacks, p)) return false;
    if (!matchesAny(filters.fields, p.fields)) return false;
    if (!matchesAny(filters.purposes, p.purposes)) return false;
    return matchesTeamSize(filters.teamSize, p.target);
  });
}

/** 진행 중 · 완료 프로젝트: 검색어만 적용해요 (나머지 필터는 모집 중에만 적용) */
export function filterTeams(projects: TeamProject[], keyword: string) {
  const q = keyword.trim().toLowerCase();
  return projects.filter((p) => hasKeyword(q, p.title, p.description, p.group));
}

/** "10/6", "10/06" → 비교용 숫자 (1006) */
const monthDayValue = (text: string) => {
  const [m, d] = text.split('/').map(Number);
  return (m || 0) * 100 + (d || 0);
};

export const SORT_OPTIONS = ['최근 활동순', '최근 등록순'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

/** 새 배열로 정렬해서 돌려줘요 */
export function sortRecruit(projects: RecruitProject[], sort: SortOption) {
  const key = (p: RecruitProject) => monthDayValue(sort === '최근 등록순' ? p.date : p.lastActive);
  return [...projects].sort((a, b) => key(b) - key(a));
}

export function sortTeams(projects: TeamProject[]) {
  return [...projects].sort((a, b) => monthDayValue(b.lastActive) - monthDayValue(a.lastActive));
}
