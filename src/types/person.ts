// src/types/person.ts
import type { TechLevel } from '../constants/levels';

export interface Skill {
  stack: string;
  level: TechLevel;
}

/** 검색·추천·저장함에서 쓰는 사람 요약 정보 */
export interface PersonSummary {
  id: string;
  name: string;
  major: string;
  isPublic: boolean;
  roles: string[];       // 희망 역할
  skills: Skill[];       // 기술과 수준
  fields: string[];      // 관심 분야
  tendencies: string[];  // 프로젝트 성향
  collab: string[];      // 협업 선호
  intro: string;
  teamTendency?: string;    // Lead / Follow / 상관없음
  experiences?: string[];   // 프로젝트 경험 한 줄 요약
}