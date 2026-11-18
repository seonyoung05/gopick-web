// src/components/layout/AppLayout/AppLayout.tsx
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useInboxSummary } from '../../../hooks/useInboxSummary';
import { useAuth } from '../../../stores/auth';
import { ProfileGateProvider } from '../../common/ProfileGate';
import { Sidebar } from '../Sidebar';
import { Topbar } from '../Topbar';
import { ProfileRequired } from './ProfileRequired';
import styles from './AppLayout.module.css';

/** 프로필이 없어도 들어갈 수 있는 화면 (홈 · 프로젝트 목록은 구경만, 지원·자세히 보기 등은 ProfileGate가 안내) */
const OPEN_WITHOUT_PROFILE = ['/', '/projects', '/profile', '/settings'];

/** 사이드바 + 상단바 + 본문(Outlet). 라우터의 layout route로 사용 */
export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  // 화면을 옮길 때마다 답을 기다리는 요청 수를 다시 셈 (제안·지원함에서 수락·거절한 뒤 반영)
  const { pathname } = useLocation();
  const { total } = useInboxSummary(pathname);
  const { account } = useAuth();
  // 그 밖의 화면은 프로필이 없으면 쫓아내지 않고 안내를 보여 줘요
  const needsProfile = !account?.profileId && !OPEN_WITHOUT_PROFILE.includes(pathname);

  return (
    <ProfileGateProvider>
      <div className={styles.layout}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} unreadCount={total} />
        <div className={styles.main}>
          <Topbar />
          <main className={styles.content}>{needsProfile ? <ProfileRequired /> : <Outlet />}</main>
        </div>
      </div>
    </ProfileGateProvider>
  );
}
