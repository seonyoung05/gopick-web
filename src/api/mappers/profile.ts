// src/api/mappers/profile.ts
import { CONTACT_TYPES, type ContactType } from '../../constants/contact';
import { TECH_LEVELS, type TechLevel } from '../../constants/levels';
import {
  EMPTY_PROFILE,
  createEmptyExperience,
  type CollabPreference,
  type ProfileForm,
} from '../../types/profile';
import type { PreferenceCategory, ProfileDetailResponse, ProfileRequest } from '../profiles';

const ETC = '기타';

/* ---------- 수준: 글자 ↔ 숫자 ---------- */
const levelToNumber = (level: TechLevel) => TECH_LEVELS.findIndex((l) => l.value === level) + 1; // 입문=1 … 심화=4
const numberToLevel = (n: number): TechLevel | null => TECH_LEVELS[n - 1]?.value ?? null;

/** ['AI', '기타'] + '블록체인' → ['AI', '블록체인'] (빈 기타는 버리고, 중복은 하나로) */
function replaceEtc(values: string[], etcText: string) {
  const out = values.flatMap((v) => (v === ETC ? (etcText.trim() ? [etcText.trim()] : []) : [v]));
  return [...new Set(out)];
}

/** 응답 category → 화면 협업 성향 묶음 */
const PREF_KEY: Record<PreferenceCategory, keyof CollabPreference> = {
  COLLAB: 'preferences',
  STYLE: 'styles',
  STRENGTH: 'strengths',
  PROJECT: 'tendencies',
  COMM: 'communication',
};

/* ---------- 화면 → 서버 (생성·수정 공통) ---------- */
export function toProfileRequest(form: ProfileForm): ProfileRequest {
  const technologies = form.stacks.flatMap((stack) => {
    const level = form.levels[stack];
    const name = stack === ETC ? form.stackEtc.trim() : stack;
    return name && level ? [{ technology: name, level: levelToNumber(level) }] : [];
  });

  return {
    name: form.name.trim(),
    major: form.major.trim(),
    contactPlatform: form.contactType,
    contactId: form.contactValue.trim(),
    isPublic: form.isPublic,
    parts: form.parts,
    technologies,
    interests: replaceEtc(form.fields, form.fieldEtc),
    preferredRoles: replaceEtc(form.wantedRoles, form.roleEtc),
    teamTendency: form.teamTendency,
    preferences: {
      collaboration: form.collab.preferences,
      styles: form.collab.styles,
      strengths: form.collab.strengths,
      projectTendencies: form.collab.tendencies,
      communication: form.collab.communication,
    },
    experiences: form.experiences.map((e) => ({
      types: replaceEtc(e.types, e.typeEtc),
      fields: replaceEtc(e.fields, e.fieldEtc),
      roles: replaceEtc(e.roles, e.roleEtc),
      technologies: replaceEtc(e.stacks, e.stackEtc),
      description: e.detail.trim(),
    })),
    intro: form.intro.trim() || null,
  };
}

/* ---------- 서버 → 화면 (내 프로필 불러오기) ---------- */
export function fromProfileDetail(res: ProfileDetailResponse): ProfileForm {
  // 기술과 수준
  const levels: Record<string, TechLevel | null> = {};
  for (const t of res.technologies) levels[t.technology] = numberToLevel(t.level);

  // 협업 성향: [{ category, value }] → 묶음별 배열
  const collab: CollabPreference = { preferences: [], styles: [], strengths: [], tendencies: [], communication: [] };
  for (const p of res.preferences) {
    const key = PREF_KEY[p.category];
    if (key) collab[key].push(p.value);
  }

  // 연락처 종류: 모르는 값이면 '기타'
  const contactType = (CONTACT_TYPES as readonly string[]).includes(res.contactPlatform)
    ? (res.contactPlatform as ContactType)
    : '기타';

  return {
    ...EMPTY_PROFILE,
    name: res.name,
    major: res.major,
    contactType,
    contactValue: res.contactId ?? '',
    isPublic: res.isPublic,
    parts: res.parts,
    stacks: res.technologies.map((t) => t.technology), // 선택지에 없는 기술도 그대로 (칩으로 표시)
    levels,
    fields: res.interests,
    wantedRoles: res.preferredRoles,
    teamTendency: res.teamTendency,
    collab,
    experiences: res.experiences.map((e) => {
      const pick = (category: string) => e.attributes.filter((a) => a.category === category).map((a) => a.value);
      return {
        ...createEmptyExperience(),
        id: String(e.experienceId),
        types: pick('TYPE'),
        fields: pick('FIELD'),
        roles: pick('ROLE'),
        stacks: pick('TECHNOLOGY'),
        detail: e.description ?? '',
      };
    }),
    intro: res.intro ?? '',
  };
}