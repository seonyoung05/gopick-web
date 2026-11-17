// src/api/mappers/recommendation.ts
// 서버 추천 결과 → 화면 추천 카드
import type { MatchCategory, MatchReason, Recommendation } from '../../types/recommendation';
import type { PersonSummary } from '../../types/person';
import type { RecommendationItem, RecommendationReason } from '../recommendations';

const toReason = (r: RecommendationReason): MatchReason => ({
  category: r.category.toLowerCase() as MatchCategory,
  text: r.text,
});

/** 프로필 목록에 없는 사람(방금 비공개로 바뀐 경우 등)은 이름만 있는 카드로 */
export const nameOnlyPerson = (profileId: number, name: string): PersonSummary => ({
  id: String(profileId),
  name,
  major: '',
  isPublic: true,
  roles: [],
  skills: [],
  fields: [],
  tendencies: [],
  collab: [],
  intro: '',
});

/** person: 프로필 상세(학과·기술 등). 관계(제안 보냄 등)는 화면에서 따로 계산해요 */
export function toRecommendation(item: RecommendationItem, person: PersonSummary | undefined): Recommendation {
  return {
    person: person ?? nameOnlyPerson(item.profileId, item.name),
    rank: item.rank,
    matched: item.matched.map(toReason),
    unmatched: item.unmatched.map(toReason),
    summary: item.summary,
    relation: 'none',
  };
}
