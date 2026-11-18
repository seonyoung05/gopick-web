// src/components/common/ProfileGate/ProfileGateProvider.tsx
// 프로필이 없는 계정이 지원·자세히 보기·스크랩 등을 누르면 띄우는 안내 모달 (AppLayout에서 한 번만 감싸요)
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../stores/auth';
import { Button } from '../../ui/Button';
import { Modal } from '../Modal';
import { ProfileGateContext } from './ProfileGateContext';

export function ProfileGateProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { account } = useAuth();
  const hasProfile = Boolean(account?.profileId);
  /** 모달에 보여 줄 행동 이름 (null이면 닫힘) */
  const [action, setAction] = useState<string | null>(null);

  const requireProfile = useCallback(
    (what = '이 기능을 쓰려면') => {
      if (hasProfile) return true;
      setAction(what);
      return false;
    },
    [hasProfile],
  );

  const value = useMemo(() => ({ hasProfile, requireProfile }), [hasProfile, requireProfile]);

  return (
    <ProfileGateContext.Provider value={value}>
      {children}
      <Modal
        open={action !== null}
        onClose={() => setAction(null)}
        size="sm"
        title="프로필을 먼저 만들어 주세요"
        description={`${action ?? '이 기능을 쓰려면'} 프로필이 필요해요. 기술·관심사·경험을 적어 두면 지원과 팀원 추천을 바로 시작할 수 있어요.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAction(null)}>
              나중에
            </Button>
            <Button
              onClick={() => {
                setAction(null);
                navigate('/profile');
              }}
            >
              프로필 만들기
            </Button>
          </>
        }
      />
    </ProfileGateContext.Provider>
  );
}
