// src/api/mappers/person.ts
// 서버 프로필 응답 → 검색·저장함 카드에서 쓰는 PersonSummary
import { TECH_LEVELS } from '../../constants/levels';
import type { PersonSummary, Skill } from '../../types/person';
import type { ProfileDetailResponse, ProfileSearchItem, TechnologyDto } from '../profiles';

/** 숫자 수준(1~4) → '입문' … '심화 경험' (범위 밖이면 버림) */
function toSkills(technologies: TechnologyDto[]): Skill[] {
  return technologies.flatMap((t) => {
    const level = TECH_LEVELS[t.level - 1]?.value;
    return level ? [{ stack: t.technology, level }] : [];
  });
}

/** 검색 결과 → 카드용 (협업·프로젝트 성향은 검색 응답에 없어서 빈 배열) */
export function personFromSearch(item: ProfileSearchItem): PersonSummary {
  return {
    id: String(item.profileId),
    name: item.name,
    major: item.major,
    isPublic: true, // 검색은 공개 프로필만 돌려줌
    roles: item.preferredRoles,
    skills: toSkills(item.technologies),
    fields: item.interests,
    tendencies: [],
    collab: [],
    intro: item.intro ?? '',
  };
}

/** 상세 조회 → 프로필 보기 모달용 (성향·경험까지 채움) */
export function personFromDetail(res: ProfileDetailResponse): PersonSummary {
  const prefs = (category: string) =>
    res.preferences.filter((p) => p.category === category).map((p) => p.value);

  // 경험 한 줄 요약: "팀 프로젝트 · 웹 · 설명"
  const experiences = res.experiences
    .map((e) => {
      const attrs = e.attributes
        .filter((a) => a.category === 'TYPE' || a.category === 'FIELD')
        .map((a) => a.value);
      return [...attrs, e.description?.trim()].filter(Boolean).join(' · ');
    })
    .filter(Boolean);

  return {
    id: String(res.profileId),
    name: res.name,
    major: res.major,
    isPublic: res.isPublic,
    roles: res.preferredRoles,
    skills: toSkills(res.technologies),
    fields: res.interests,
    tendencies: prefs('PROJECT'),
    collab: prefs('COLLAB'),
    intro: res.intro ?? '',
    teamTendency: res.teamTendency ?? undefined,
    experiences,
  };
}