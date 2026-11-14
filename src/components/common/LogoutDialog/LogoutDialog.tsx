// src/components/common/LogoutDialog/LogoutDialog.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../Modal';
import { useToast } from '../Toast';
import { Button } from '../../ui/Button';
import { useAuth } from '../../../stores/auth';

interface LogoutDialogProps {
  open: boolean;
  onClose: () => void;
}

export function LogoutDialog({ open, onClose }: LogoutDialogProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    setPending(true);
    try {
      await logout(); // 서버 요청이 실패해도 화면에서는 로그아웃 처리됨
      onClose();
      toast('로그아웃했어요');
      navigate('/login', { replace: true });
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="로그아웃할까요?"
      description="다시 로그인하면 이어서 이용할 수 있어요."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            취소
          </Button>
          <Button onClick={handleLogout} disabled={pending}>
            {pending ? '로그아웃하는 중…' : '로그아웃'}
          </Button>
        </>
      }
    />
  );
}