// src/types/profile.ts
import type { ContactType } from '../constants/contact';
import type { TechLevel } from '../constants/levels';

export interface Experience {
  id: string;
  types: string[];      // 개인 프로젝트, 팀 프로젝트 ...
  fields: string[];     // AI, 데이터, 웹 ...
  roles: string[];      // 기획, Frontend ...
  stacks: string[];     // Python, Java ...
  detail: string;
}

export interface CollabPreference {
  preferences: string[];   // 협업 선호
  styles: string[];        // 진행 스타일
  strengths: string[];     // 기여 강점
  tendencies: string[];    // 프로젝트 성향
  communication: string[]; // 커뮤니케이션
}

export interface ProfileForm {
  // 기본 정보
  name: string;
  major: string;
  contactType: ContactType;
  contactValue: string;
  isPublic: boolean;
  parts: string[];

  // 역량
  stacks: string[];
  levels: Record<string, TechLevel | null>; // { Java: '실전 경험', Python: null }

  // 관심 분야
  fields: string[];

  // 프로젝트 경험
  experiences: Experience[];

  // 희망 역할
  wantedRoles: string[];
  teamTendency: string | null;

  // 협업 성향
  collab: CollabPreference;

  // 소개
  intro: string;
}

export const EMPTY_PROFILE: ProfileForm = {
  name: '',
  major: '',
  contactType: '디스코드',
  contactValue: '',
  isPublic: true,
  parts: [],
  stacks: [],
  levels: {},
  fields: [],
  experiences: [],
  wantedRoles: [],
  teamTendency: null,
  collab: { preferences: [], styles: [], strengths: [], tendencies: [], communication: [] },
  intro: '',
};