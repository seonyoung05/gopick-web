// src/stores/auth/AuthProvider.tsx
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi, type AccountResponse, type Credentials } from '../../api';
import { AuthContext, type AuthStatus, type AuthStore } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [account, setAccount] = useState<AccountResponse | null>(null);

  const applyAccount = (next: AccountResponse | null) => {
    setAccount(next);
    setStatus(next ? 'authenticated' : 'unauthenticated');
  };

  /** 서버에 "지금 누구야?" 물어보기 */
  const refresh = useCallback(async () => {
    try {
      applyAccount(await authApi.getMe());
    } catch {
      // 401(비로그인)이든 서버 연결 실패든 로그인 안 된 것으로 처리
      applyAccount(null);
    }
  }, []);

  // 앱이 켜질 때 한 번 확인
  useEffect(() => {
    refresh();
  }, [refresh]);

  const store = useMemo<AuthStore>(
    () => ({
      status,
      account,
      login: async (body: Credentials) => {
        const res = await authApi.login(body); // 실패하면 ApiError가 화면까지 전달됨
        applyAccount(res);
        return res;
      },
      signUp: async (body: Credentials) => {
        const res = await authApi.signUp(body); // 가입하면 서버가 바로 로그인시켜 줌
        applyAccount(res);
        return res;
      },
      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          applyAccount(null); // 서버 요청이 실패해도 화면에서는 로그아웃 처리
        }
      },
      setProfileId: (profileId: number) =>
        setAccount((prev) => (prev ? { ...prev, profileId } : prev)),
      refresh,
    }),
    [status, account, refresh],
  );

  return <AuthContext.Provider value={store}>{children}</AuthContext.Provider>;
}