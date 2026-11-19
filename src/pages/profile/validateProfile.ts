// src/pages/profile/validateProfile.ts
import type { ProfileForm } from '../../types/profile';

/** 필수 항목 이름 (진행도 8개와 같은 순서) */
export const REQUIRED_KEYS = [
  'name', 'major', 'contact', 'parts', 'stacks', 'levels', 'fields', 'roles',
] as const;

export type RequiredKey = (typeof REQUIRED_KEYS)[number];
export type ProfileErrors = Partial<Record<RequiredKey, string>>;

/** 각 필수 항목이 어느 섹션에 있는지 (스크롤용) */
export const SECTION_OF: Record<RequiredKey, string> = {
  name: 'basic',
  major: 'basic',
  contact: 'basic',
  parts: 'basic',
  stacks: 'skill',
  levels: 'skill',
  fields: 'field',
  roles: 'role',
};

const isBlank = (s: string) => s.trim() === '';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateProfile(form: ProfileForm): ProfileErrors {
  const errors: ProfileErrors = {};

  if (isBlank(form.name)) errors.name = '이름을 입력해 주세요.';
  if (isBlank(form.major)) errors.major = '전공을 입력해 주세요.';

  // 연락처: 하나 이상, 줄마다 형식 확인 (첫 번째로 걸린 줄의 문구를 보여 줘요)
  const filled = form.contacts.filter((c) => !isBlank(c.value));
  if (filled.length === 0) {
    errors.contact = '연락처를 하나 이상 입력해 주세요.';
  } else {
    for (const c of form.contacts) {
      if (isBlank(c.value)) {
        errors.contact = `${c.type} 칸이 비어 있어요. 입력하거나 줄을 지워 주세요.`;
      } else if (c.type === '이메일' && !EMAIL_RE.test(c.value.trim())) {
        errors.contact = '이메일 형식을 확인해 주세요. (예: name@example.com)';
      } else if (c.type === '링크드인' && !c.value.includes('linkedin.com')) {
        errors.contact = '링크드인 프로필 주소를 입력해 주세요.';
      }
      if (errors.contact) break;
    }
  }

  if (form.parts.length === 0) errors.parts = '소속 파트를 하나 이상 골라 주세요.';

  if (form.stacks.length === 0) {
    errors.stacks = '사용할 수 있는 기술을 하나 이상 골라 주세요.';
  } else if (form.stacks.includes('기타') && isBlank(form.stackEtc)) {
    errors.stacks = '기타 기술 이름을 입력해 주세요.';
  }

  const missingLevels = form.stacks.filter((s) => !form.levels[s]);
  if (form.stacks.length === 0) {
    errors.levels = '기술을 고르면 수준을 선택할 수 있어요.';
  } else if (missingLevels.length > 0) {
    errors.levels = `수준을 고르지 않은 기술이 ${missingLevels.length}개 있어요.`;
  }

  if (form.fields.length === 0) {
    errors.fields = '관심 분야를 하나 이상 골라 주세요.';
  } else if (form.fields.includes('기타') && isBlank(form.fieldEtc)) {
    errors.fields = '기타 관심 분야를 입력해 주세요.';
  }

  if (form.wantedRoles.length === 0) {
    errors.roles = '희망 역할을 하나 이상 골라 주세요.';
  } else if (form.wantedRoles.includes('기타') && isBlank(form.roleEtc)) {
    errors.roles = '기타 희망 역할을 입력해 주세요.';
  }

  return errors;
}