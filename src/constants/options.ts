// src/constants/options.ts
// 프로필 · 프로젝트 등록 · 검색 필터에서 공통으로 쓰는 선택지

export const ROLES = ['기획', 'Frontend', 'Backend', 'AI', 'Design', '기타'] as const;
export const TECH_STACKS = ['Python', 'Java', 'React', 'SQL', 'Figma', '기타'] as const;
export const FIELDS = ['AI', '데이터', '웹', '앱', 'UX·UI', '기타'] as const;
export const PURPOSES = ['학습', '포트폴리오', '공모전', '해커톤', '실사용 서비스'] as const;
export const TEAM_SIZES = ['3명', '4명', '5명', '6명 이상'] as const;
export const PROJECT_STATUSES = ['모집 중', '진행 중', '완료'] as const;

export const PROJECT_TENDENCIES = [
  '완성도 중시', '빠른 MVP 선호', '배우는 것 중시', '실사용 서비스 선호', '공모전 관심',
] as const;

export const COLLAB_PREFERENCES = [
  '빠른 피드백', '의견 공유 적극적', '문서화 선호', '회의 최소화 선호', '코드 리뷰 선호',
  '비동기 소통 선호', '자주 소통 선호',
] as const;

/** 검색 필터용: 끝의 '기타'는 필터에서 의미가 없어서 뺀 버전 */
export const withoutEtc = <T extends string>(list: readonly T[]) =>
  list.filter((v) => v !== '기타');