// src/api/mappers/project.ts
// 서버 프로젝트 응답 ↔ 화면 데이터(모집 카드, 진행 프로젝트, 등록 폼) 변환
import type { RequiredLevel } from '../../constants/levels';
import { STAGES } from '../../constants/project';
import { ROLES, type Condition } from '../../constants/projectForm';
import {
  emptyForm,
  emptyRoleDetail,
  newLinkId,
  type ProjectFormValues,
  type RoleDetail,
} from '../../pages/project-form/formModel';
import type { RecruitProject, TeamProject } from '../../types/project';
import type {
  ConditionMode,
  ProjectAttribute,
  ProjectCreateRequest,
  ProjectDetail,
  ProjectRole,
  ProjectStage,
  ProjectUpdateRequest,
  Recruitment,
} from '../projects';

/* ---------- 값 사전 ---------- */

/** 화면 역할 ↔ 서버 역할 */
const ROLE_TO_API: Record<string, ProjectRole> = {
  기획: 'PM',
  Frontend: 'FRONTEND',
  Backend: 'BACKEND',
  AI: 'AI',
  Design: 'DESIGN',
  기타: 'OTHERS',
};
const API_TO_ROLE = Object.fromEntries(
  Object.entries(ROLE_TO_API).map(([label, api]) => [api, label]),
) as Record<ProjectRole, string>;

export const roleToApi = (label: string): ProjectRole => ROLE_TO_API[label] ?? 'OTHERS';
export const roleLabel = (role: ProjectRole) => API_TO_ROLE[role] ?? role;

/** 화면 단계 순서(STAGES)와 같은 순서 */
export const API_STAGES: readonly ProjectStage[] = ['PLANNING', 'DESIGN', 'IMPLEMENTATION', 'TESTING', 'PRODUCTION'];

const CONDITION_TO_API: Record<Condition, ConditionMode> = {
  상관없음: 'NONE',
  우대: 'PREFERRED',
  필수: 'REQUIRED',
};
const API_TO_CONDITION: Record<ConditionMode, Condition> = {
  NONE: '상관없음',
  PREFERRED: '우대',
  REQUIRED: '필수',
};

/** 요구 수준: '수준 무관' = 1(입문 이상), '기초 경험 이상' = 2 */
const levelToMin = (level: RequiredLevel) => (level === '기초 경험 이상' ? 2 : 1);
const minToLevel = (min: number): RequiredLevel => (min >= 2 ? '기초 경험 이상' : '수준 무관');

/* ---------- 날짜 ---------- */

const pad = (n: number) => String(n).padStart(2, '0');
/** "2026-11-11T12:00:00" → "11/11" */
const shortDate = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
};
/** "2026-11-11T12:00:00" → "2026.11" */
const monthDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}`;
};

/** 생성·상태 변경·단계 변경 중 가장 최근 시각 (최근 활동순 정렬용) */
export const lastActiveAt = (p: Pick<ProjectDetail, 'createdAt' | 'statusUpdatedAt' | 'stageUpdatedAt'>) =>
  [p.createdAt, p.statusUpdatedAt, p.stageUpdatedAt]
    .filter((v): v is string => Boolean(v))
    .sort()
    .at(-1) ?? p.createdAt;

/* ---------- 공통 조각 ---------- */

const attrs = (list: ProjectAttribute[], category: ProjectAttribute['category']) =>
  list.filter((a) => a.category === category).map((a) => a.value);

const leaderOf = (p: ProjectDetail) => p.members.find((m) => m.authority === 'LEADER');
const memberName = (name: string | null) => name ?? '비공개 프로필';

/** 내가 이 프로젝트의 팀원인지 / 팀장인지 */
export function myMembership(p: ProjectDetail, myProfileId: number | null | undefined) {
  const me = p.members.find((m) => m.profileId === myProfileId);
  return { isMember: Boolean(me), isLeader: me?.authority === 'LEADER' };
}

/** "기획 1명, Backend 1명" */
function teamText(p: ProjectDetail) {
  const counts = new Map<string, number>();
  for (const m of p.members) counts.set(roleLabel(m.role), (counts.get(roleLabel(m.role)) ?? 0) + 1);
  return [...counts].map(([role, n]) => `${role} ${n}명`).join(', ');
}

/** 모집 역할 기술 문구: "스택 무관" / "React 우대" / "Python, SQL 필수" */
function skillText(r: Recruitment) {
  if (r.techMode === 'NONE' || r.technologies.length === 0) return '스택 무관';
  return `${r.technologies.map((t) => t.technology).join(', ')} ${API_TO_CONDITION[r.techMode]}`;
}

/** 0~4: 그 단계 진행 중, 5: 완료 */
export function currentStageIndex(p: Pick<ProjectDetail, 'lifecycleStatus' | 'stage'>) {
  if (p.lifecycleStatus === 'COMPLETED') return STAGES.length;
  const i = p.stage ? API_STAGES.indexOf(p.stage) : -1;
  return i === -1 ? 0 : i;
}

/* ---------- 서버 → 모집 카드 ---------- */

export function toRecruitProject(
  p: ProjectDetail,
  opts: { myProfileId?: number | null; scrapped: boolean },
): RecruitProject {
  const { isLeader } = myMembership(p, opts.myProfileId);
  const recruiting = p.recruitments.filter((r) => r.remainingCount > 0);
  const remaining = recruiting.reduce((sum, r) => sum + r.remainingCount, 0);
  const collab = attrs(p.attributes, 'COLLAB');

  return {
    id: String(p.projectId),
    title: p.title,
    author: memberName(leaderOf(p)?.name ?? null),
    date: shortDate(p.createdAt),
    current: p.members.length,
    target: String(p.members.length + remaining), // 서버에 목표 인원이 없어서 현재 + 남은 모집 인원
    lastActive: shortDate(lastActiveAt(p)),
    description: p.description ?? '',
    roles: recruiting.map((r) => ({ role: roleLabel(r.role), count: r.remainingCount, skill: skillText(r) })),
    fields: attrs(p.attributes, 'FIELD'),
    purposes: attrs(p.attributes, 'PURPOSE'),
    details: [
      p.extra,
      p.wish && `함께하고 싶은 팀원: ${p.wish}`,
      collab.length > 0 && `협업 선호 ${collab.join(', ')}`,
      p.members.length > 0 && `현재 팀 ${teamText(p)}`,
    ].filter((line): line is string => Boolean(line)),
    scrapped: opts.scrapped,
    // 아직 지원·제안 API가 없어서 '받은 제안 보기(offers)'는 쓰지 않음
    action: isLeader ? 'mine' : 'apply',
  };
}

/* ---------- 서버 → 진행 중 · 완료 프로젝트 ---------- */

export function toTeamProject(p: ProjectDetail, opts: { scrapped: boolean }): TeamProject {
  const leader = leaderOf(p);
  return {
    id: String(p.projectId),
    title: p.title,
    group: leader ? `${memberName(leader.name)} 님의 팀` : 'GoPick 프로젝트',
    period:
      p.lifecycleStatus === 'COMPLETED' ? `${monthDate(p.createdAt)} ~ ${monthDate(p.statusUpdatedAt)}` : undefined,
    lastActive: shortDate(lastActiveAt(p)),
    description: p.description ?? '',
    currentStage: currentStageIndex(p),
    scrapped: opts.scrapped,
    members: p.members.map((m) => ({ name: memberName(m.name), role: roleLabel(m.role) })),
    outputs: p.links.length > 0 ? p.links.map((l) => ({ label: l.type, url: l.url })) : undefined,
    // 세부 과제·활동 기록은 아직 서버에 없어서 빈 값 (화면에서만 체크 가능)
    tasks: STAGES.map(() => []),
    log: [],
  };
}

/* ---------- 서버 → 등록 폼 (수정 화면 불러오기) ---------- */

export function toProjectForm(p: ProjectDetail): ProjectFormValues {
  const base = emptyForm();

  const roleDetails: Record<string, RoleDetail> = {};
  for (const r of p.recruitments) {
    roleDetails[roleLabel(r.role)] = {
      ...emptyRoleDetail(),
      count: Math.max(1, r.remainingCount),
      condition: API_TO_CONDITION[r.techMode],
      techs: r.technologies.map((t) => t.technology),
      levels: Object.fromEntries(r.technologies.map((t) => [t.technology, minToLevel(t.minLevel)])),
    };
  }

  // 현재 팀 = 실제 팀원 역할별 인원
  const currentTeam = Object.fromEntries(ROLES.map((r) => [r, 0])) as Record<string, number>;
  for (const m of p.members) currentTeam[roleLabel(m.role)] = (currentTeam[roleLabel(m.role)] ?? 0) + 1;

  return {
    ...base,
    name: p.title,
    description: p.description ?? '',
    fields: attrs(p.attributes, 'FIELD'),
    purposes: attrs(p.attributes, 'PURPOSE'),
    collab: attrs(p.attributes, 'COLLAB'),
    roles: p.recruitments.map((r) => roleLabel(r.role)),
    roleDetails,
    experience: API_TO_CONDITION[p.experience?.mode ?? 'NONE'],
    extraNote: p.extra ?? '',
    myRole: roleLabel(leaderOf(p)?.role ?? 'PM'),
    currentTeam,
    links: p.links.map((l) => ({ id: newLinkId(), type: l.type, url: l.url })),
    background: p.background ?? '',
    goal: p.goal ?? '',
    wantedTeam: p.wish ?? '',
  };
}

/* ---------- 등록 폼 → 서버 ---------- */

/** 생성·수정에 공통으로 들어가는 필드 */
function toCommonBody(form: ProjectFormValues): Required<Omit<ProjectUpdateRequest, 'recruiting'>> {
  const attributes: ProjectAttribute[] = [
    ...form.fields.map((value) => ({ category: 'FIELD' as const, value })),
    ...form.purposes.map((value) => ({ category: 'PURPOSE' as const, value })),
    ...form.collab.map((value) => ({ category: 'COLLAB' as const, value })),
  ];

  const recruitments: Recruitment[] = form.roles.map((role) => {
    const d = form.roleDetails[role] ?? emptyRoleDetail();
    const techMode = CONDITION_TO_API[d.condition];
    return {
      role: roleToApi(role),
      remainingCount: d.count,
      techMode,
      technologies:
        techMode === 'NONE'
          ? []
          : d.techs.map((t) => ({ technology: t, minLevel: levelToMin(d.levels[t] ?? '수준 무관') })),
    };
  });

  return {
    title: form.name.trim(),
    description: form.description.trim(),
    background: form.background.trim(),
    goal: form.goal.trim(),
    wish: form.wantedTeam.trim(),
    extra: form.extraNote.trim(),
    attributes,
    experience: { mode: CONDITION_TO_API[form.experience], types: [], fields: [] },
    recruitments,
    links: form.links
      .filter((l) => l.url.trim() !== '')
      .map((l) => ({ type: l.type, url: l.url.trim() })),
  };
}

/** 새 프로젝트 등록 (form.myRole: 등록하는 본인의 역할 → 그 역할의 팀장이 됨) */
export function toProjectCreateRequest(form: ProjectFormValues): ProjectCreateRequest {
  return { ...toCommonBody(form), role: roleToApi(form.myRole), recruiting: true };
}

/** 기존 프로젝트 수정 (목록은 보낸 값으로 전체 교체) */
export function toProjectUpdateRequest(form: ProjectFormValues): ProjectUpdateRequest {
  return toCommonBody(form);
}
