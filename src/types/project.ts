// src/types/project.ts

/** 모집글 카드 하단에 보이는 버튼 종류 */
/** apply: 지원 가능 · mine: 내가 팀장 · member: 이미 팀원 · offers: 받은 제안 보기 */
export type RecruitAction = 'apply' | 'mine' | 'member' | 'offers';

export interface RoleNeed {
  role: string;
  count: number;
  /** 예: "React 우대", "Python 필수", "스택 무관" */
  skill: string;
}

export interface RecruitProject {
  id: string;
  title: string;
  author: string;
  /** 등록일 표시 문자열 (예: "10/06") */
  date: string;
  current: number;
  /** 목표 인원 (예: "4", "4~5") */
  target: string;
  lastActive: string;
  description: string;
  roles: RoleNeed[];
  /** 프로젝트 분야 (회색 태그) */
  fields: string[];
  /** 프로젝트 목적 (파란 태그) */
  purposes: string[];
  /** "자세히 보기"를 펼치면 보이는 줄들 */
  details: string[];
  /** 모집글 보기 "상세 안내" 칸 (없으면 그 칸을 숨겨요) */
  extra?: string;
  wish?: string;
  team?: string;
  scrapped: boolean;
  action: RecruitAction;
}

export interface Member {
  /** 아바타 색 기준 (어디서나 같은 사람은 같은 색). 탈퇴한 회원이면 null */
  profileId?: number | null;
  name: string;
  role: string;
}

export interface StageTask {
  text: string;
  done: boolean;
}

export interface ActivityLog {
  date: string;
  author: string;
  text: string;
}

export interface OutputLink {
  label: string;
  url: string;
}

/** 진행 중 · 완료 프로젝트 */
export interface TeamProject {
  id: string;
  title: string;
  /** 내가 팀원(팀장 포함)인 프로젝트 */
  mine?: boolean;
  /** 소속 (예: "GDGoC 1차 프로젝트 7팀") */
  group: string;
  /** 완료 프로젝트의 기간 (예: "2026.03 ~ 2026.06") */
  period?: string;
  lastActive: string;
  description: string;
  /** 0~4: 해당 단계 진행 중, 5: 전 단계 완료 */
  currentStage: number;
  scrapped: boolean;
  members: Member[];
  outputs?: OutputLink[];
  /** 단계별 세부 과제 (STAGES와 같은 순서, 5개 배열) */
  tasks: StageTask[][];
  log: ActivityLog[];
}
