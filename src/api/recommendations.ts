// src/api/recommendations.ts
// 팀원 추천 (서버 RecommendationController)
// - 팀장만, 프로젝트가 모집하는 역할 하나 기준
// - 비공개 프로필 · 이미 팀원인 사람은 서버가 빼고 줘요
import { api } from './client';
import type { ProjectRole } from './projects';

export type RecommendationCategory =
  | 'STACK'
  | 'COLLAB'
  | 'EXPERIENCE'
  | 'ROLE'
  | 'FIELD'
  | 'PURPOSE'
  | 'MAJOR'
  | 'PART';

export interface RecommendationReason {
  category: RecommendationCategory;
  text: string;
}

export interface RecommendationItem {
  profileId: number;
  name: string;
  /** 1부터, 동점이면 같은 숫자 */
  rank: number;
  matched: RecommendationReason[];
  unmatched: RecommendationReason[];
  /** AI가 쓴 한 줄 추천 이유 (없을 수 있음) */
  summary?: string;
}

export interface RecommendationResponse {
  projectId: number;
  role: ProjectRole;
  items: RecommendationItem[];
}

export const recommendationsApi = {
  /** 추천 받기. AI를 거쳐서 몇 초 걸릴 수 있어요 */
  get: (projectId: number, role: ProjectRole) =>
    api.get<RecommendationResponse>(`/projects/${projectId}/recommendations`, { role }),
};
