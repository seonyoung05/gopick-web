// src/components/layout/Topbar/Topbar.tsx
import clsx from 'clsx';
import { Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AvatarMenu } from '../AvatarMenu';
import { NotificationMenu } from '../NotificationMenu';
import styles from './Topbar.module.css';

/** 상단바: 검색 · 알림 · 내 계정 */
export function Topbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onSearchPage = pathname.startsWith('/search');

  return (
    <header className={styles.topbar}>
      <div className={styles.right}>
        {/* 검색은 /search 화면에서 사람·프로젝트를 골라서 해요 */}
        <button
          type="button"
          className={clsx(styles.iconButton, onSearchPage && styles.iconButtonActive)}
          aria-label="검색"
          aria-current={onSearchPage ? 'page' : undefined}
          title="사람·프로젝트 검색"
          onClick={() => navigate('/search')}
        >
          <Search size={22} aria-hidden="true" />
        </button>
        <NotificationMenu />
        <AvatarMenu />
      </div>
    </header>
  );
}
