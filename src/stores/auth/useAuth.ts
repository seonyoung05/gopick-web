// src/stores/auth/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export function useAuth() {
  const store = useContext(AuthContext);
  if (!store) throw new Error('useAuth는 AuthProvider 안에서만 쓸 수 있어요.');
  return store;
}