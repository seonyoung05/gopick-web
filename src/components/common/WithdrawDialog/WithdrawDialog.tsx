// src/components/common/WithdrawDialog/WithdrawDialog.tsx
// 회원 탈퇴 확인 모달 (DELETE /me)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '../../../api';
import { useAuth } from '../../../stores/auth';
import { Button } from '../../ui/Button';
import { Checkbox } from '../../ui/Checkbox';
import { Modal } from '../Modal';
import { useToast } from '../Toast';
import styles from './WithdrawDialog.module.css';

interface WithdrawDialogProps {
  open: boolean;
  onClose: () => void;
}

/** 서버 규칙(회원 탈퇴 API 문서)을 사용자 말로 */
const NOTICES = [
  '계정, 프로필, 저장한 프로필·스크랩한 프로젝트가 삭제돼요.',
  '주고받은 지원·제안 기록이 모두 삭제돼요.',
  '준비 중·진행 중인 프로젝트에서는 자동으로 나가요. 내가 팀장인 준비 중 프로젝트는 삭제돼요.',
  '완료한 프로젝트에는 "탈퇴한 회원"으로 참여 기록만 남아요.',
  '같은 이메일로 다시 가입할 수 있어요.',
];

export function WithdrawDialog({ open, onClose }: WithdrawDialogProps) {
  const { withdraw } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [agreed, setAgreed] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    if (pending) return;
    setAgreed(false);
    setError(null);
    onClose();
  };

  const handleWithdraw = async () => {
    setPending(true);
    setError(null);
    try {
      await withdraw();
      toast('탈퇴했어요. 그동안 GoPick을 이용해 주셔서 감사해요');
      navigate('/login', { replace: true });
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setError('진행 중인 프로젝트의 팀장이에요. 다른 팀원에게 팀장을 넘긴 뒤에 탈퇴할 수 있어요.');
      } else {
        setError('탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요.');
      }
      setPending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="sm"
      title="정말 탈퇴할까요?"
      description="탈퇴하면 되돌릴 수 없어요. 아래 내용을 확인해 주세요."
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={pending}>
            취소
          </Button>
          <button type="button" className={styles.danger} onClick={handleWithdraw} disabled={!agreed || pending}>
            {pending ? '탈퇴하는 중…' : '탈퇴하기'}
          </button>
        </>
      }
    >
      <ul className={styles.list}>
        {NOTICES.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <Checkbox checked={agreed} onChange={setAgreed} label="위 내용을 확인했고, 탈퇴할게요" />
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </Modal>
  );
}
