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
  contactPlatform: string;
  /** 본인 프로필 조회일 때만 옴 */
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

export const profilesApi = {
  /** 생성 (201, { profileId }) */
  create: (body: ProfileRequest) => api.post<{ profileId: number }>('/profiles', body),
  /** 상세 조회 */
  get: (profileId: number) => api.get<ProfileDetailResponse>(`/profiles/${profileId}`),
  /** 수정 (204, 본문 없음) */
  update: (profileId: number, body: ProfileRequest) => api.patch<void>(`/profiles/${profileId}`, body),
};