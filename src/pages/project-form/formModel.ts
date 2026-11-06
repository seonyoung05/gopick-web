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

// ---------- 모집글 초안 (AI 연동 전 목업) ----------

export function buildDraft(form: ProjectFormValues): string {
  const tags = [...form.fields, ...form.purposes].join(' · ');
  const head = `[${tags || '프로젝트'}] ${form.name || '(프로젝트명)'} 팀원을 모집해요`;
  const parts = [head, form.description];
  if (form.background) parts.push(`■ 이 프로젝트를 하는 이유\n${form.background}`);
  if (form.goal) parts.push(`■ 우리가 만들고 싶은 것\n${form.goal}`);
  if (form.wantedTeam) parts.push(`■ 이런 분과 함께하고 싶어요\n${form.wantedTeam}`);
  return parts.filter(Boolean).join('\n\n');
}

/** 연동 시 AI에 보낼 프롬프트 (미리보기용) */
export function buildPrompt(form: ProjectFormValues): string {
  const roles = form.roles.map((r) => roleSummary(r, form.roleDetails[r])).join(' / ') || '미정';
  return [
    '아래 정보로 팀원 모집글을 친근한 말투로 써 주세요.',
    `프로젝트명: ${form.name || '-'}`,
    `설명: ${form.description || '-'}`,
    `분야: ${form.fields.join(', ') || '-'} / 목적: ${form.purposes.join(', ') || '-'}`,
    `모집: ${roles}`,
    `협업 선호: ${form.collab.join(', ') || '-'}`,
    `추진 배경: ${form.background || '-'}`,
    `목표: ${form.goal || '-'}`,
    `원하는 팀원: ${form.wantedTeam || '-'}`,
  ].join('\n');
}

// ---------- 수정 화면용 목업 ----------

export interface MyProject {
  id: string;
  /** 상단 칩에 보이는 이름 */
  label: string;
  title: string;
  /** 편집을 시작할 때마다 새 값을 만들어 원본이 바뀌지 않게 함 */
  create: () => ProjectFormValues;
}

const vocarchive = (): ProjectFormValues => {
  const form: ProjectFormValues = {
    name: 'Vocarchive',
    description: 'LLM으로 사용자의 오답 패턴을 분석해 맞춤형 영단어장을 만들어 주는 학습 서비스예요.',
    fields: ['AI', '웹'],
    purposes: ['포트폴리오', '해커톤'],
    teamSizes: ['4명', '5명'],
    roles: ['Backend', 'Frontend'],
    roleDetails: {
      Backend: { count: 2, condition: '상관없음', techs: [], levels: {} },
      Frontend: { count: 1, condition: '우대', techs: ['React'], levels: { React: '기초 경험 이상' } },
    },
    experience: '상관없음',
    extraNote: '초보자도 참여할 수 있어요. 디자인 경험이 있으면 우대해요.',
    collab: ['빠른 피드백', '문서화 선호', '코드 리뷰 선호'],
    currentTeam: { ...emptyTeam(), 기획: 1, AI: 1 },
    links: [
      { id: newLinkId(), type: '기획안', url: 'https://notion.so/vocarchive' },
      { id: newLinkId(), type: 'GitHub', url: 'https://github.com/gdgoc/vocarchive' },
    ],
    background: '영단어 앱을 여러 개 써 봤지만, 한 번 틀린 단어를 계속 틀리는 문제는 그대로였어요. 틀린 이유를 분석해서 나에게 맞는 단어장을 만들어 주면 어떨까 하는 생각에서 시작했어요.',
    goal: '해커톤 기간 안에 오답 기록을 넣으면 틀리는 패턴을 분석하고, 맞춤형 단어장까지 만들어 주는 흐름이 실제로 동작하는 웹 서비스를 완성하는 것',
    wantedTeam: '막히는 부분이 있으면 바로 공유하고, 마감 직전까지 같이 버그를 잡아줄 분이면 좋겠어요. LLM을 처음 다뤄 봐도 괜찮아요.',
    draft: null,
  };
  form.draft = buildDraft(form);
  return form;
};

export const MY_PROJECTS: MyProject[] = [
  { id: 'vocarchive', label: 'Vocarchive · 모집 중', title: 'Vocarchive', create: vocarchive },
];

/** 각 섹션 컴포넌트가 공통으로 받는 props */
export interface SectionProps {
  form: ProjectFormValues;
  update: (patch: Partial<ProjectFormValues>) => void;
  /** 등록 버튼을 한 번 눌러 보면 true → 빠진 항목을 빨갛게 표시 */
  showErrors: boolean;
}
