// src/constants/levels.ts

/** 프로필: 기술별 활용 수준 */
export const TECH_LEVELS = [
  { value: '입문', desc: '관련 경험이 거의 없음' },
  { value: '기초 경험', desc: '간단한 프로젝트·코딩 경험 있음' },
  { value: '실전 경험', desc: '프로젝트에서 직접 활용해 봄' },
  { value: '심화 경험', desc: '복잡한 문제를 독립적으로 해결 가능' },
] as const;

export type TechLevel = (typeof TECH_LEVELS)[number]['value'];

/** 프로젝트 등록: 기술 조건이 우대·필수일 때 요구 수준 */
export const REQUIRED_LEVELS = [
  { value: '기초 경험 이상', desc: '간단한 프로젝트·코딩 경험 이상' },
  { value: '수준 무관', desc: '입문자도 지원 가능' },
] as const;

export type RequiredLevel = (typeof REQUIRED_LEVELS)[number]['value'];