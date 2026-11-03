// src/constants/contact.ts

/** 프로필 연락처 종류 (드롭다운 순서 그대로) */
export const CONTACT_TYPES = ['디스코드', '카카오톡', '이메일', '링크드인', '기타'] as const;

export type ContactType = (typeof CONTACT_TYPES)[number];

/** 종류별 입력칸 안내 문구 */
export const CONTACT_PLACEHOLDER: Record<ContactType, string> = {
  디스코드: '디스코드 아이디 (예: sumung.k)',
  카카오톡: '카카오톡 아이디 또는 오픈채팅 링크',
  이메일: 'name@example.com',
  링크드인: 'https://www.linkedin.com/in/아이디',
  기타: '연락 방법을 자유롭게 적어 주세요',
};

/** 종류별 input type (이메일은 모바일에서 이메일 키보드가 뜨도록) */
export const CONTACT_INPUT_TYPE: Record<ContactType, 'text' | 'email' | 'url'> = {
  디스코드: 'text',
  카카오톡: 'text',
  이메일: 'email',
  링크드인: 'url',
  기타: 'text',
};