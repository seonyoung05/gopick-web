// src/components/layout/Topbar/Topbar.tsx
import clsx from 'clsx';
import { Search, Bell } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AvatarMenu } from '../AvatarMenu';
import { Badge } from '../../ui/Label';
import { MOCK_UNREAD_COUNT } from '../../../constants/nav';
import styles from './Topbar.module.css';

interface TopbarProps {
  unreadCount?: number;
}

export function Topbar({ unreadCount = MOCK_UNREAD_COUNT }: TopbarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onSearchPage = pathname.startsWith('/search');
  const onOffersPage = pathname.startsWith('/offers');

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
        <button
          type="button"
          className={clsx(styles.iconButton, onOffersPage && styles.iconButtonActive)}
          aria-label={unreadCount > 0 ? `알림, 새 알림 ${unreadCount}개` : '알림'}
          aria-current={onOffersPage ? 'page' : undefined}
          title="제안·지원 확인"
          onClick={() => navigate('/offers')}
        >
          <Bell size={22} aria-hidden="true" />
          <Badge count={unreadCount} className={styles.bellBadge} />
        </button>
        <AvatarMenu />
      </div>
    </header>
  );
}
