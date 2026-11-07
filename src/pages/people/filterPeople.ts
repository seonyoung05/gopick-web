// src/pages/people/filterPeople.ts
import { TECH_LEVELS } from '../../constants/levels';
import type { FilterValues } from '../../components/common/FilterPanel';
import type { PersonSummary } from '../../types/person';

/** 수준의 순서 번호: 입문=0, 기초=1, 실전=2, 심화=3 */
const levelRank = (level: string) => TECH_LEVELS.findIndex((l) => l.value === level);

const MIN_LEVEL_RANK: Record<string, number> = {
  '수준 무관': 0,
  '기초 경험 이상': 1,
  '실전 경험 이상': 2,
};

/** 고른 값이 없으면 통과, 있으면 하나라도 겹쳐야 통과 */
const matchesAny = (selected: string[] = [], owned: string[]) =>
  selected.length === 0 || selected.some((v) => owned.includes(v));

export function filterPeople(people: PersonSummary[], filters: FilterValues, keyword: string) {
  const q = keyword.trim().toLowerCase();
  const minRank = MIN_LEVEL_RANK[filters.minLevel?.[0] ?? '수준 무관'] ?? 0;
  const selectedStacks = filters.stacks ?? [];

  return people.filter((p) => {
    if (!p.isPublic) return false;

    if (q && ![p.name, p.major, p.intro].some((text) => text.toLowerCase().includes(q))) return false;

    if (!matchesAny(filters.roles, p.roles)) return false;
    if (!matchesAny(filters.fields, p.fields)) return false;
    if (!matchesAny(filters.tendencies, p.tendencies)) return false;
    if (!matchesAny(filters.collab, p.collab)) return false;

    // 기술 + 최소 수준
    const okSkills = p.skills.filter((s) => levelRank(s.level) >= minRank).map((s) => s.stack);
    if (selectedStacks.length > 0) {
      if (!selectedStacks.some((stack) => okSkills.includes(stack))) return false;
    } else if (minRank > 0 && okSkills.length === 0) {
      return false;
    }

    return true;
  });
}

/** 결과 카드에 보여 줄 기술 요약: "Java 기초 경험, SQL 기초 경험" */
export const skillSummary = (p: PersonSummary) =>
  p.skills.map((s) => `${s.stack} ${s.level}`).join(', ') || '입력한 기술 없음';