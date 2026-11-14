// src/stores/auth/AuthProvider.tsx
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi, profilesApi, type AccountResponse, type Credentials } from '../../api';
import { AuthContext, type AuthStatus, type AuthStore } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);

  /** 프로필이 있으면 이름만 가져와 기억 (실패해도 로그인에는 지장 없음) */
  const loadProfileName = useCallback(async (profileId: number | null) => {
    if (!profileId) {
      setProfileName(null);
      return;
    }
    try {
      const profile = await profilesApi.get(profileId);
      setProfileName(profile.name);
    } catch {
      setProfileName(null);
    }
  }, []);

  const applyAccount = useCallback(
    (next: AccountResponse | null) => {
      setAccount(next);
      setStatus(next ? 'authenticated' : 'unauthenticated');
      loadProfileName(next?.profileId ?? null);
    },
    [loadProfileName],
  );

  const refresh = useCallback(async () => {
    try {
      applyAccount(await authApi.getMe());
    } catch {
      applyAccount(null);
    }
  }, [applyAccount]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const store = useMemo<AuthStore>(
    () => ({
      status,
      account,
      profileName,
      login: async (body: Credentials) => {
        const res = await authApi.login(body);
        applyAccount(res);
        return res;
      },
      signUp: async (body: Credentials) => {
        const res = await authApi.signUp(body);
        applyAccount(res);
        return res;
      },
      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          applyAccount(null);
        }
      },
      setProfileId: (profileId: number) => setAccount((prev) => (prev ? { ...prev, profileId } : prev)),
      setProfileName: (name: string) => setProfileName(name),
      refresh,
    }),
    [status, account, profileName, applyAccount, refresh],
  );

  return <AuthContext.Provider value={store}>{children}</AuthContext.Provider>;
}