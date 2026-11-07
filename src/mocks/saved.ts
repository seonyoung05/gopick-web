// src/mocks/saved.ts
import type { RecommendRelation } from '../types/recommendation';

export interface SavedProfile {
  personId: string;
  savedAt: string; // 저장한 날짜 (최근 저장순 정렬용)
  relation: RecommendRelation;
}

/** 내가 저장한 프로필 (API 연결 전 임시) */
export const MOCK_SAVED_PROFILES: SavedProfile[] = [
  { personId: 'p9', savedAt: '2026-10-08', relation: 'offered' },   // 정다온: 제안 보냄
  { personId: 'p11', savedAt: '2026-10-07', relation: 'rejected' }, // 최유나: 제안 거절됨
  { personId: 'p12', savedAt: '2026-10-05', relation: 'none' },     // 한지우: 비공개 전환
  { personId: 'p10', savedAt: '2026-10-02', relation: 'none' },     // 이준호
];