// src/constants/recommendation.ts
import type { MatchCategory, MatchReason } from '../types/recommendation';

/** 팀 결정: 기술 스택 → 협업 성향 → 프로젝트 경험 → (역할·분야·목적) → 학과·소속 파트 */
export const MATCH_PRIORITY: Record<MatchCategory, number> = {
  stack: 1,
  collab: 2,
  experience: 3,
  role: 4,
  field: 5,
  purpose: 6,
  major: 7,
  part: 8,
};

export const MATCH_LABEL: Record<MatchCategory, string> = {
  stack: '기술 스택',
  collab: '협업 성향',
  experience: '프로젝트 경험',
  role: '희망 역할',
  field: '관심 분야',
  purpose: '목적·성향',
  major: '학과',
  part: '소속 파트',
};

/** 우선순위가 높은 항목부터 보이도록 정렬 */
export const sortByPriority = (reasons: MatchReason[]) =>
  [...reasons].sort((a, b) => MATCH_PRIORITY[a.category] - MATCH_PRIORITY[b.category]);