// src/components/layout/AppLayout/AppLayout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { Topbar } from '../Topbar';
import styles from './AppLayout.module.css';

/** 사이드바 + 상단바 + 본문(Outlet). 라우터의 layout route로 사용 */
export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className={styles.main}>
        <Topbar />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
