// src/components/layout/Topbar/Topbar.tsx
import { useState, type FormEvent } from 'react';
import { Search, Bell } from 'lucide-react';
import { AvatarMenu } from '../AvatarMenu';
import { Badge } from '../../ui/Label';
import { MOCK_UNREAD_COUNT } from '../../../constants/nav';
import styles from './Topbar.module.css';

interface TopbarProps {
  unreadCount?: number;
  /** 검색어 제출 시 호출 (Enter) */
  onSearch?: (keyword: string) => void;
}

export function Topbar({
  unreadCount = MOCK_UNREAD_COUNT,
  onSearch,
}: TopbarProps) {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = keyword.trim();
    if (q) onSearch?.(q);
  };

  return (
    <header className={styles.topbar}>
      <form className={styles.search} role="search" onSubmit={handleSubmit}>
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          placeholder="사람이나 프로젝트 검색"
          aria-label="사람이나 프로젝트 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </form>

      <div className={styles.right}>
        <button
          type="button"
          className={styles.bell}
          aria-label={unreadCount > 0 ? `알림, 새 알림 ${unreadCount}개` : '알림'}
        >
          <Bell size={22} aria-hidden="true" />
          <Badge count={unreadCount} className={styles.bellBadge} />
        </button>
        <AvatarMenu />
      </div>
    </header>
  );
}
