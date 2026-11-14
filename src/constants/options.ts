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

/** 프로필 전용 */
export const PARTS = ['AI', 'Dev', 'Design'] as const;
export const TEAM_TENDENCIES = ['Lead', 'Follow', '상관없음'] as const;

/** 프로필 - 프로젝트 경험 */
export const EXPERIENCE_TYPES = ['개인 프로젝트', '팀 프로젝트', '공모전', '해커톤', '연구', '기타'] as const;
export const EXPERIENCE_FIELDS = ['AI', '데이터', '웹', '앱', '기타'] as const;

/** 프로필 - 협업 성향 (다섯 묶음) */
export const COLLAB_GROUPS = [
  {
    key: 'preferences',
    label: '협업 선호',
    options: ['빠른 피드백', '의견 공유 적극적', '문서화 선호', '회의 최소화 선호', '코드 리뷰 선호'],
  },
  {
    key: 'styles',
    label: '진행 스타일',
    options: ['일정 준수', '꼼꼼하게', '빠르게 프로토타이핑', '끝까지 파고들기', '새 기술 도전'],
  },
  {
    key: 'strengths',
    label: '기여 강점',
    options: ['아이디어 제안', '문제 해결', '자료 조사', '발표 가능', '문서 정리', '디버깅 좋아함'],
  },
  {
    key: 'tendencies',
    label: '프로젝트 성향',
    options: ['완성도 중시', '빠른 MVP 선호', '배우는 것 중시', '실사용 서비스 선호', '공모전 관심'],
  },
  {
    key: 'communication',
    label: '커뮤니케이션',
    options: ['비동기 소통 선호', '자주 소통 선호', '피드백 환영', '질문 많이 하는 편'],
  },
] as const;

/** 선택지에 없는 값(직접 입력했던 값)을 '기타' 앞에 칩으로 끼워 넣음 */
export function withExtraOptions(base: readonly string[], selected: readonly string[]) {
  const extras = selected.filter((v) => !base.includes(v));
  if (extras.length === 0) return base;
  const etcIndex = base.indexOf('기타');
  return etcIndex === -1
    ? [...base, ...extras]
    : [...base.slice(0, etcIndex), ...extras, ...base.slice(etcIndex)];
}