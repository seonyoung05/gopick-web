// src/components/layout/RequireAuth/RequireAuth.tsx
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../stores/auth';

/** 로그인 안 했으면 로그인 화면으로. 프로필이 없을 때는 AppLayout이 화면별로 안내해요 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  // 앱이 켜지고 /me 확인하는 짧은 순간: 아무것도 안 그림 (깜빡임 방지)
  if (status === 'loading') return null;

  if (status === 'unauthenticated') {
    // 로그인하면 어디서 왔든 홈부터 시작 (pathAfterAuth)
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}