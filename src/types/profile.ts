// src/types/profile.ts
import type { ContactType } from '../constants/contact';
import type { TechLevel } from '../constants/levels';

export interface Experience {
  id: string;
  types: string[];      // 개인 프로젝트, 팀 프로젝트 ...
  typeEtc: string;
  fields: string[];     // AI, 데이터, 웹 ...
  fieldEtc: string;
  roles: string[];      // 기획, Frontend ...
  roleEtc: string;
  stacks: string[];     // Python, Java ...
  stackEtc: string;
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
  stackEtc: string; // '기타'를 골랐을 때 직접 입력한 기술 이름
  levels: Record<string, TechLevel | null>;

  // 관심 분야
  fields: string[];
  fieldEtc: string; // '기타'를 골랐을 때 직접 입력한 분야

  // 프로젝트 경험
  experiences: Experience[];

  // 희망 역할
  wantedRoles: string[];
  roleEtc: string; // '기타'를 골랐을 때 직접 입력한 역할
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
  stackEtc: '',
  levels: {},
  fields: [],
  fieldEtc: '',
  experiences: [],
  wantedRoles: [],
  roleEtc: '',
  teamTendency: null,
  collab: { preferences: [], styles: [], strengths: [], tendencies: [], communication: [] },
  intro: '',
};

/** "+ 프로젝트 경험 추가"를 누를 때 새로 만드는 빈 경험 */
export function createEmptyExperience(): Experience {
  return {
    id: crypto.randomUUID(),
    types: [],
    typeEtc: '',
    fields: [],
    fieldEtc: '',
    roles: [],
    roleEtc: '',
    stacks: [],
    stackEtc: '',
    detail: '',
  };
}