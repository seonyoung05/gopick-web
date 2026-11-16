// src/components/layout/RequireAuth/RequireAuth.tsx
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../stores/auth';

/** 로그인 안 했으면 로그인 화면으로, 프로필이 없으면 내 프로필로 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status, account } = useAuth();
  const location = useLocation();

  // 앱이 켜지고 /me 확인하는 짧은 순간: 아무것도 안 그림 (깜빡임 방지)
  if (status === 'loading') return null;

  if (status === 'unauthenticated') {
    // 로그인하면 어디서 왔든 홈부터 시작 (pathAfterAuth)
    return <Navigate to="/login" replace />;
  }

  // 프로필이 없으면 프로필 작성부터 (내 프로필 화면 자체는 예외)
  if (!account?.profileId && location.pathname !== '/profile') {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}