// src/components/layout/Sidebar/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { PanelLeft } from 'lucide-react';
import { Badge } from '../../ui/Label';
import {
  NAV_ITEMS,
  MOCK_UNREAD_COUNT,
  MOCK_SUMMARY,
  MOCK_DECISION_NOTE,
} from '../../../constants/nav';
import styles from './Sidebar.module.css';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  /** 제안·지원 메뉴 옆에 붙는 새 알림 수 */
  unreadCount?: number;
}

export function Sidebar({ collapsed = false, onToggle, unreadCount = MOCK_UNREAD_COUNT }: SidebarProps) {
  const { recruiting, ongoing, done } = MOCK_SUMMARY;

  return (
    <aside className={clsx(styles.sidebar, collapsed && styles.collapsed)}>
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">
          <i style={{ background: 'var(--blue)' }} />
          <i style={{ background: 'var(--red)' }} />
          <i style={{ background: 'var(--yellow)' }} />
          <i style={{ background: 'var(--green)' }} />
        </span>
        <span className={clsx(styles.name, 't-h2')}>GoPick</span>
        <button
          type="button"
          className={styles.toggle}
          onClick={onToggle}
          aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
          aria-expanded={!collapsed}
        >
          <PanelLeft size={20} />
        </button>
      </div>

      <nav className={styles.nav} aria-label="주요 메뉴">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) => clsx(styles.link, isActive && styles.active)}
          >
            <Icon size={20} aria-hidden="true" />
            <span className={styles.label}>{label}</span>
            {to === '/offers' ? <Badge count={unreadCount} className={styles.badge} /> : null}
          </NavLink>
        ))}
      </nav>

      <div className={styles.summary}>
        <strong>
          모집 중 {recruiting} · 진행 중 {ongoing} · 완료 {done}
        </strong>
        <span>{MOCK_DECISION_NOTE}</span>
      </div>
    </aside>
  );
}
