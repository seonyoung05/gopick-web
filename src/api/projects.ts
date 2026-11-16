import { api } from './client';

export type LifecycleStatus = 'PREPARING' | 'IN_PROGRESS' | 'COMPLETED';
export type ProjectStage = 'PLANNING' | 'DESIGN' | 'IMPLEMENTATION' | 'TESTING' | 'PRODUCTION';
export type ProjectRole = 'PM' | 'FRONTEND' | 'BACKEND' | 'AI' | 'DESIGN' | 'OTHERS';
export type ConditionMode = 'NONE' | 'PREFERRED' | 'REQUIRED';

export interface ProjectAttribute {
  category: 'FIELD' | 'PURPOSE' | 'COLLAB';
  value: string;
}

export interface ProjectExperience {
  mode: ConditionMode;
  types?: string[];
  fields?: string[];
}

export interface Recruitment {
  role: ProjectRole;
  remainingCount: number;
  techMode: ConditionMode;
  technologies: { technology: string; minLevel: number }[];
}

export interface ProjectLink {
  type: string;
  url: string;
}

/** 목록·수정·시작·완료·스크랩 목록이 돌려주는 기본 정보 */
export interface ProjectSummary {
  projectId: number;
  title: string;
  description: string;
  background: string;
  goal: string;
  wish: string;
  extra: string;
  lifecycleStatus: LifecycleStatus;
  stage: ProjectStage | null;
  recruiting: boolean;
  createdAt: string;
  statusUpdatedAt: string;
  stageUpdatedAt: string | null;
}

export interface ProjectMember {
  /** 탈퇴한 회원이면 null (이름은 "탈퇴한 회원입니다") */
  profileId: number | null;
  name: string | null; // 다른 사람의 비공개 프로필이면 null
  isPublic: boolean;
  role: ProjectRole;
  authority: 'LEADER' | 'MEMBER';
  joinedAt: string;
}

/** 목록(GET /projects)·내 프로젝트 한 줄: 기본 정보 + 팀원·모집·속성 */
export interface ProjectListItem extends ProjectSummary {
  members: ProjectMember[];
  recruitments: Recruitment[];
  attributes: ProjectAttribute[];
}

/** GET /me/projects 한 줄 */
export interface MyProject extends ProjectListItem {
  myAuthority: 'LEADER' | 'MEMBER';
}

/** 상세(GET /projects/{id}): 목록 정보 + 경험 조건 · 링크 */
export interface ProjectDetail extends ProjectListItem {
  experience: ProjectExperience;
  links: ProjectLink[];
}

/** 화면에서 다루는 프로젝트: 목록에서 받았으면 경험 조건·링크가 없고, 상세를 받으면 채워져요 */
export type ProjectData = ProjectListItem & Partial<Pick<ProjectDetail, 'experience' | 'links'>>;

type ProjectText = Partial<
  Pick<ProjectSummary, 'description' | 'background' | 'goal' | 'wish' | 'extra'>
>;

export interface ProjectCreateRequest extends ProjectText {
  title: string;
  role: ProjectRole; // 만드는 사람의 역할 (LEADER가 됨)
  recruiting: boolean;
  attributes?: ProjectAttribute[];
  experience?: ProjectExperience;
  recruitments?: Recruitment[];
  links?: ProjectLink[];
}

/** 보낸 필드만 바뀜. null은 보내면 안 됨 */
export type ProjectUpdateRequest = Partial<
  Omit<ProjectCreateRequest, 'role'>
>;

export interface ProjectListQuery {
  status?: LifecycleStatus;
  recruiting?: boolean;
}

function toQuery(q: ProjectListQuery = {}) {
  const params = new URLSearchParams();
  if (q.status) params.set('status', q.status);
  if (q.recruiting !== undefined) params.set('recruiting', String(q.recruiting));
  const s = params.toString();
  return s ? `?${s}` : '';
}

export const projectsApi = {
  /** 전체 목록 (팀원·모집·속성 포함) */
  list: (q?: ProjectListQuery) => api.get<ProjectListItem[]>(`/projects${toQuery(q)}`),
  get: (id: number) => api.get<ProjectDetail>(`/projects/${id}`),
  create: (body: ProjectCreateRequest) => api.post<{ projectId: number }>('/projects', body),
  update: (id: number, body: ProjectUpdateRequest) =>
    api.patch<ProjectSummary>(`/projects/${id}`, body),

  start: (id: number) => api.post<ProjectSummary>(`/projects/${id}/start`),
  changeStage: (id: number, stage: ProjectStage) =>
    api.patch<ProjectSummary>(`/projects/${id}/stage`, { stage }),
  complete: (id: number) => api.post<ProjectSummary>(`/projects/${id}/complete`),
  delegateLeader: (id: number, targetProfileId: number) =>
    api.patch<void>(`/projects/${id}/leader`, { targetProfileId }),

  scrap: (id: number) => api.post<void>(`/projects/${id}/scraps`),
  unscrap: (id: number) => api.delete<void>(`/projects/${id}/scraps`),
  myScraps: () => api.get<ProjectSummary[]>('/me/scrapped-projects'),
  /** 내가 팀원(팀장 포함)인 프로젝트 + 내 권한 */
  myProjects: () => api.get<MyProject[]>('/me/projects'),

  /** 프로젝트 삭제 (팀장만, 204) */
  remove: (id: number) => api.delete<void>(`/projects/${id}`),
  /** 프로젝트에서 나가기 (204). 준비 중 프로젝트의 팀장이 나가면 프로젝트가 삭제돼요 */
  leave: (id: number) => api.delete<void>(`/projects/${id}/members/me`),
};
