// src/pages/settings/AccountSettingsPage.tsx
import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { LogoutDialog } from '../../components/common/LogoutDialog';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../stores/auth';
import styles from './AccountSettingsPage.module.css';

export default function AccountSettingsPage() {
  const { status, account } = useAuth();
  const toast = useToast();
  const [logoutOpen, setLogoutOpen] = useState(false);

  // TODO(5단계): 로그인 확인은 라우팅에서 한 번에 처리
  if (status === 'loading') return null;

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className="t-h1">계정 설정</h1>
        <p>로그인에 쓰는 계정 정보를 관리해요. 다른 구성원에게 보이는 정보는 내 프로필에서 고칠 수 있어요.</p>
      </div>

      <div className={styles.cards}>
        <section className={styles.card} aria-labelledby="account-info">
          <h2 id="account-info">계정 정보</h2>
          <div className={styles.row}>
            <span className={styles.key}>이메일</span>
            <span className={styles.value}>{account?.email}</span>
          </div>
          {/* TODO: 가입일은 /me 응답에 createdAt이 생기면 추가 */}
          <div className={styles.row}>
            <div className={styles.rowText}>
              <strong>로그아웃</strong>
              <span>이 기기에서 로그아웃해요.</span>
            </div>
            <Button variant="ghost" onClick={() => setLogoutOpen(true)}>
              로그아웃
            </Button>
          </div>
        </section>

        <section className={styles.card} aria-labelledby="withdraw">
          <h2 id="withdraw">회원 탈퇴</h2>
          <p className={styles.desc}>탈퇴하면 프로필과 활동 기록이 삭제되고 되돌릴 수 없어요.</p>
          {/* TODO: 회원 탈퇴 흐름은 대표 기능 완성 후 */}
          <button type="button" className={styles.dangerButton} onClick={() => toast('회원 탈퇴는 준비 중이에요')}>
            회원 탈퇴
          </button>
        </section>
      </div>

      <LogoutDialog open={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </div>
  );
}