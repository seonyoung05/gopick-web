// src/pages/project-form/formModel.ts
// 폼 상태 모양, 초기값, 계산(요약·체크리스트·초안)을 한 곳에 모아 둔 파일
import type { RequiredLevel } from '../../constants/levels';
import { ROLES, type Condition } from '../../constants/projectForm';

export interface RoleDetail {
  count: number;
  condition: Condition;
  techs: string[];
  /** 기술별 요구 수준 (우대·필수일 때) */
  levels: Record<string, RequiredLevel>;
}

export interface LinkRow {
  id: string;
  type: string;
  url: string;
}

export interface ProjectFormValues {
  name: string;
  description: string;
  fields: string[];
  purposes: string[];
  teamSizes: string[];
  /** 모집 역할 (선택한 순서 그대로) */
  roles: string[];
  roleDetails: Record<string, RoleDetail>;
  experience: Condition;
  extraNote: string;
  collab: string[];
  /** 등록하는 본인의 역할 (등록하면 이 역할의 팀장이 됨) */
  myRole: string;
  /** 현재 팀 역할별 인원 */
  currentTeam: Record<string, number>;
  links: LinkRow[];
  background: string;
  goal: string;
  wantedTeam: string;
  /** 모집글 초안 (null이면 아직 안 만듦) */
  draft: string | null;
}

let seq = 0;
export const newLinkId = () => `link-${++seq}`;

export const emptyRoleDetail = (): RoleDetail => ({
  count: 1,
  condition: '상관없음',
  techs: [],
  levels: {},
});

const emptyTeam = (): Record<string, number> =>
  Object.fromEntries(ROLES.map((r) => [r, 0]));

/** "새 프로젝트" 초기값. 등록하는 본인은 기획 1명으로 시작 */
export function emptyForm(): ProjectFormValues {
  return {
    name: '',
    description: '',
    fields: [],
    purposes: [],
    teamSizes: [],
    roles: [],
    roleDetails: {},
    experience: '상관없음',
    extraNote: '',
    collab: [],
    myRole: '기획',
    currentTeam: { ...emptyTeam(), 기획: 1 },
    links: [],
    background: '',
    goal: '',
    wantedTeam: '',
    draft: null,
  };
}

// ---------- 팀 구성 요약 ----------

const sizeNumber = (label: string) => parseInt(label, 10); // "6명 이상" → 6

/** 선택한 목표 팀 규모 → 표시 문구와 허용 범위. 선택 안 했으면 null */
export function targetRange(teamSizes: string[]) {
  if (teamSizes.length === 0) return null;
  const nums = teamSizes.map(sizeNumber);
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const openEnded = teamSizes.some((s) => s.includes('이상'));
  const label = openEnded
    ? `${min}명 이상`
    : min === max
      ? `${min}명`
      : `${min}~${max}명`;
  return { min, max: openEnded ? Infinity : max, label };
}

export function summarize(form: ProjectFormValues) {
  const current = Object.values(form.currentTeam).reduce((a, b) => a + b, 0);
  const recruit = form.roles.reduce((sum, r) => sum + (form.roleDetails[r]?.count ?? 0), 0);
  const total = current + recruit;
  const range = targetRange(form.teamSizes);
  const fits = range ? total >= range.min && total <= range.max : null;
  return { current, recruit, total, range, fits };
}

/** 역할 요약을 두 조각으로 (예: "Backend 2명" / "스택 무관") */
export function roleParts(role: string, d: RoleDetail) {
  const tech =
    d.condition === '상관없음'
      ? '스택 무관'
      : `기술 ${d.condition}${d.techs.length ? ` (${d.techs.join(', ')})` : ''}`;
  return { head: `${role} ${d.count}명`, tech };
}

/** 역할 한 줄 요약 (예: "Backend 2명, 스택 무관") */
export function roleSummary(role: string, d: RoleDetail) {
  const { head, tech } = roleParts(role, d);
  return `${head}, ${tech}`;
}

// ---------- 추천에 필요한 항목 ----------

export interface RequiredItem {
  key: string;
  label: string;
  done: boolean;
}

export function requiredItems(form: ProjectFormValues): RequiredItem[] {
  const techOk =
    form.roles.length > 0 &&
    form.roles.every((r) => {
      const d = form.roleDetails[r];
      return d && (d.condition === '상관없음' || d.techs.length > 0);
    });
  return [
    { key: 'name', label: '프로젝트명', done: form.name.trim() !== '' },
    { key: 'fields', label: '프로젝트 분야', done: form.fields.length > 0 },
    { key: 'purposes', label: '프로젝트 목적', done: form.purposes.length > 0 },
    { key: 'roles', label: '모집 역할', done: form.roles.length > 0 },
    { key: 'tech', label: '기술 조건', done: techOk },
  ];
}

/** 각 섹션 컴포넌트가 공통으로 받는 props */
export interface SectionProps {
  form: ProjectFormValues;
  update: (patch: Partial<ProjectFormValues>) => void;
  /** 등록 버튼을 한 번 눌러 보면 true → 빠진 항목을 빨갛게 표시 */
  showErrors: boolean;
}
