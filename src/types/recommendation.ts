// src/types/recommendation.ts
import type { PersonSummary } from './person';

/** 일치·불일치 항목이 어떤 기준에서 나왔는지 */
export type MatchCategory =
  | 'stack'      // 기술 스택
  | 'collab'     // 협업 성향
  | 'experience' // 프로젝트 경험
  | 'role'       // 희망 역할
  | 'field'      // 관심 분야
  | 'purpose'    // 프로젝트 목적·성향
  | 'major'      // 학과
  | 'part';      // 소속 파트

export interface MatchReason {
  category: MatchCategory;
  text: string; // 예: "Java 심화 경험", "문서화 선호"
}

/** 지금 이 사람과 내 프로젝트의 관계 (버튼 상태 결정) */
export type RecommendRelation =
  | 'none'     // 아무 관계 없음 → 참여 제안 보내기
  | 'offered'  // 내가 이미 제안함 → 제안 보냄
  | 'applied'  // 이 사람이 이미 지원함 → 받은 지원 보기
  | 'rejected' // 같은 방향 거절 이력 → 재제안 불가
  | 'member';  // 이미 팀원 → 추천에서 보통 제외되지만 대비

export interface Recommendation {
  person: PersonSummary;
  rank: number; // 동점이면 같은 숫자
  matched: MatchReason[];
  unmatched: MatchReason[];
  relation: RecommendRelation;
}