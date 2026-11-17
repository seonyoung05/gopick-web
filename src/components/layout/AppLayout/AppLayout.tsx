// src/components/layout/AppLayout/AppLayout.tsx
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useInboxSummary } from '../../../hooks/useInboxSummary';
import { Sidebar } from '../Sidebar';
import { Topbar } from '../Topbar';
import styles from './AppLayout.module.css';

/** 사이드바 + 상단바 + 본문(Outlet). 라우터의 layout route로 사용 */
export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  // 화면을 옮길 때마다 답을 기다리는 요청 수를 다시 셈 (제안·지원함에서 수락·거절한 뒤 반영)
  const { pathname } = useLocation();
  const { total } = useInboxSummary(pathname);

  return (
    <div className={styles.layout}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} unreadCount={total} />
      <div className={styles.main}>
        <Topbar />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
