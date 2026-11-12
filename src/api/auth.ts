// src/api/auth.ts
import { api } from './client';

export interface Credentials {
  email: string;
  password: string;
}

/** 회원가입·로그인·/me 공통 응답 */
export interface AccountResponse {
  accountId: number;
  email: string;
  /** 프로필을 아직 안 만들었으면 null */
  profileId: number | null;
}

export const authApi = {
  /** 회원가입 (성공하면 자동 로그인) */
  signUp: (body: Credentials) => api.post<AccountResponse>('/accounts', body),
  login: (body: Credentials) => api.post<AccountResponse>('/auth/login', body),
  logout: () => api.post<void>('/auth/logout'),
  /** 현재 로그인한 계정 (비로그인이면 401 UNAUTHENTICATED) */
  getMe: () => api.get<AccountResponse>('/me'),
};