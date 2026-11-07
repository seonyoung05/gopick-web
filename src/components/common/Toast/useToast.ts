// src/components/common/Toast/useToast.ts
import { useContext } from 'react';
import { ToastContext } from './ToastContext';

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast는 ToastProvider 안에서만 쓸 수 있어요.');
  return show;
}