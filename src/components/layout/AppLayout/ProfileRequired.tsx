// src/components/layout/AppLayout/ProfileRequired.tsx
// 프로필이 없는 계정이 프로필이 필요한 화면(검색·추천·프로젝트·제안·지원·저장함)에 들어왔을 때 보여 주는 안내
import { UserRoundPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/Button';
import styles from './AppLayout.module.css';

export function ProfileRequired() {
  const navigate = useNavigate();
  return (
    <section className={styles.profileRequired} aria-labelledby="profile-required-title">
      <span className={styles.profileRequiredIcon} aria-hidden="true">
        <UserRoundPlus size={28} />
      </span>
      <h1 id="profile-required-title">프로필을 먼저 만들어 주세요</h1>
      <p>
        이 기능은 프로필이 있어야 쓸 수 있어요.
        <br />
        기술·관심사·경험을 적어 두면 팀원 추천과 지원, 제안을 바로 시작할 수 있어요.
      </p>
      <div className={styles.profileRequiredActions}>
        <Button variant="ghost" onClick={() => navigate('/')}>
          홈으로
        </Button>
        <Button onClick={() => navigate('/profile')}>프로필 만들기</Button>
      </div>
    </section>
  );
}
