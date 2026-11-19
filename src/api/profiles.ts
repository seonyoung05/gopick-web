// src/api/profiles.ts
import { api } from './client';

export interface TechnologyDto {
  technology: string;
  level: number; // 1~4
}

/** 연락처 한 줄 (여러 개 등록 가능, 최대 3개) */
export interface ContactDto {
  platform: string;
  value: string;
}

/** 응답 → 연락처 목록 (새 형식 contacts가 있으면 그걸, 없으면 예전 한 쌍) */
export function contactsOf(res: Pick<ProfileDetailResponse, 'contacts' | 'contactPlatform' | 'contactId'>): ContactDto[] {
  if (res.contacts && res.contacts.length > 0) return res.contacts.filter((c) => c.value);
  return res.contactId ? [{ platform: res.contactPlatform || '기타', value: res.contactId }] : [];
}

export interface ProfileRequest {
  name: string;
  major: string;
  /** 여러 연락처 (서버가 아직 모르면 무시하고 아래 한 쌍을 써요) */
  contacts: ContactDto[];
  /** 예전 형식: 첫 번째 연락처 (서버 전환 기간 동안 같이 보내요) */
  contactPlatform: string;
  contactId: string;
  isPublic: boolean;
  parts: string[];
  technologies: TechnologyDto[];
  interests: string[];
  preferredRoles: string[];
  teamTendency: string | null;
  preferences: {
    collaboration: string[];
    styles: string[];
    strengths: string[];
    projectTendencies: string[];
    communication: string[];
  };
  experiences: {
    types: string[];
    fields: string[];
    roles: string[];
    technologies: string[];
    description: string;
  }[];
  intro: string | null;
}

export type PreferenceCategory = 'COLLAB' | 'STYLE' | 'STRENGTH' | 'PROJECT' | 'COMM';
export type ExperienceCategory = 'TYPE' | 'FIELD' | 'ROLE' | 'TECHNOLOGY';

export interface ProfileDetailResponse {
  profileId: number;
  name: string;
  major: string;
  /** 본인 · 수락된 참여 요청 상대에게만 옴 (그 외 null) */
  contacts?: ContactDto[] | null;
  /** 예전 형식 (한 쌍) */
  contactPlatform?: string | null;
  contactId?: string | null;
  isPublic: boolean;
  teamTendency: string | null;
  intro: string | null;
  parts: string[];
  technologies: TechnologyDto[];
  interests: string[];
  preferredRoles: string[];
  preferences: { category: PreferenceCategory; value: string }[];
  experiences: {
    experienceId: number;
    description: string | null;
    attributes: { category: ExperienceCategory; value: string }[];
  }[];
}

/** 공개 프로필 검색 결과 한 명 (연락처·협업 성향은 오지 않음) */
export interface ProfileSearchItem {
  profileId: number;
  name: string;
  major: string;
  intro: string | null;
  technologies: TechnologyDto[];
  interests: string[];
  preferredRoles: string[];
}

/** 검색 조건 (모두 선택, 함께 쓰면 AND) */
export type ProfileSearchQuery = {
  technology?: string;
  interest?: string;
  preferredRole?: string;
};

/** 내 북마크 목록 한 줄 (비공개로 바뀐 프로필은 이름이 '비공개 프로필'로 옴) */
export interface BookmarkedProfile {
  profileId: number;
  isPublic: boolean;
  name: string;
}

export const profilesApi = {
  /** 생성 (201, { profileId }) */
  create: (body: ProfileRequest) => api.post<{ profileId: number }>('/profiles', body),
  /** 상세 조회 */
  get: (profileId: number) => api.get<ProfileDetailResponse>(`/profiles/${profileId}`),
  /** 수정 (204, 본문 없음) */
  update: (profileId: number, body: ProfileRequest) => api.patch<void>(`/profiles/${profileId}`, body),

  /** 공개 프로필 검색 (프로필 ID 내림차순) */
  search: (query?: ProfileSearchQuery) => api.get<ProfileSearchItem[]>('/profiles', query),

  /** 북마크 추가·취소 (204, 이미 된 상태여도 204) */
  bookmark: (profileId: number) => api.post<void>(`/profiles/${profileId}/bookmarks`),
  unbookmark: (profileId: number) => api.delete<void>(`/profiles/${profileId}/bookmarks`),
  /** 내 북마크 목록 (최근 저장순) */
  myBookmarks: () => api.get<BookmarkedProfile[]>('/me/bookmarked-profiles'),
};