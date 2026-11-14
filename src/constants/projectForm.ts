// src/constants/projectForm.ts
// 프로젝트 모집 등록·수정 폼의 선택지 (Figma 03 화면 기준)

export const PROJECT_FIELDS = ['AI', '데이터', '웹', '앱', 'UX·UI', '기타'] as const;
export const PROJECT_PURPOSES = ['학습', '포트폴리오', '공모전', '해커톤', '실사용 서비스'] as const;

export const TEAM_SIZES = ['3명', '4명', '5명', '6명 이상'] as const;

export const ROLES = ['기획', 'Frontend', 'Backend', 'AI', 'Design', '기타'] as const;
export type Role = (typeof ROLES)[number];

export const TECH_STACKS = ['Python', 'Java', 'React', 'SQL', 'Figma', '기타'] as const;

export const CONDITIONS = ['상관없음', '우대', '필수'] as const;
export type Condition = (typeof CONDITIONS)[number];

/** 기술 조건별 안내 문구 */
export const ROLE_CONDITION_HELP: Record<Condition, string> = {
  상관없음:
    '스택을 미리 정하지 않아요. 지원자가 이 역할에서 가장 잘 쓰는 기술의 수준을 매기고, 스택은 팀이 꾸려진 뒤 함께 정해요.',
  우대: '골라 둔 기술이 있으면 가산점을 줘요. 없어도 추천에서 빠지지 않아요.',
  필수: '골라 둔 기술을 쓸 수 있는 지원자만 추천해요.',
};

export const EXPERIENCE_HELP: Record<Condition, string> = {
  상관없음: '프로젝트 경험은 추천 평가에 쓰지 않아요. 경험이 있든 없든 순위에 영향이 없어요.',
  우대: '프로젝트 경험이 있는 지원자를 더 높게 추천해요.',
  필수: '프로젝트 경험이 있는 지원자만 추천해요.',
};

export const COLLAB_STYLES = [
  '빠른 피드백',
  '의견 공유 적극적',
  '문서화 선호',
  '회의 최소화 선호',
  '코드 리뷰 선호',
  '비동기 소통 선호',
  '자주 소통 선호',
] as const;

export const LINK_TYPES = ['기획안', 'GitHub', '공모전 안내', '기타'] as const;
