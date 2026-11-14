// src/api/profiles.ts
import { api } from './client';

export interface TechnologyDto {
  technology: string;
  level: number; // 1~4
}

export interface ProfileRequest {
  name: string;
  major: string;
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
  /** 본인 프로필 조회일 때만 옴 */
  contactPlatform?: string;
  contactId?: string;
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