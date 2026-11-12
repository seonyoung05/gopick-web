// src/components/layout/AvatarMenu/AvatarMenu.tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, User } from 'lucide-react';
import { Avatar } from '../../ui/Avatar';
import { LogoutDialog } from '../../common/LogoutDialog';
import styles from './AvatarMenu.module.css';
import { myAvatarSeed, useAuth } from '../../../stores/auth';

export function AvatarMenu() {
  const { account, profileName } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // 바깥 클릭 · ESC로 닫기
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const displayName = profileName ?? account?.email ?? '?';

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="계정 메뉴"
      >
        <Avatar name={displayName} seed={myAvatarSeed(account)} size="top" />
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          <div className={styles.account}>
            {profileName && <span className={styles.name}>{profileName}</span>}
            <span className={styles.email}>{account?.email}</span>
          </div>
          <hr className={styles.divider} />
          <button type="button" role="menuitem" className={styles.item} onClick={() => go('/profile')}>
            <User aria-hidden="true" />
            내 프로필
          </button>
          <button type="button" role="menuitem" className={styles.item} onClick={() => go('/settings')}>
            <Settings aria-hidden="true" />
            계정 설정
          </button>
          <hr className={styles.divider} />
          <button
            type="button"
            role="menuitem"
            className={styles.item}
            onClick={() => {
              setOpen(false);
              setLogoutOpen(true);
            }}
          >
            <LogOut aria-hidden="true" />
            로그아웃
          </button>
        </div>
      )}

      <LogoutDialog open={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </div>
  );
}