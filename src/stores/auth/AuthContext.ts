// src/stores/auth/AuthContext.ts
import { createContext } from 'react';
import type { AccountResponse, Credentials } from '../../api';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthStore {
  status: AuthStatus;
  /** 로그인한 계정 (로그인 전이면 null) */
  account: AccountResponse | null;
  login: (body: Credentials) => Promise<AccountResponse>;
  signUp: (body: Credentials) => Promise<AccountResponse>;
  logout: () => Promise<void>;
  /** 프로필을 처음 만든 뒤 profileId를 반영 */
  setProfileId: (profileId: number) => void;
  /** 서버에 다시 물어봐서 상태 갱신 */
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthStore | null>(null);