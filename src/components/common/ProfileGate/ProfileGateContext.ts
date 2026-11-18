// src/components/common/ProfileGate/ProfileGateContext.ts
import { createContext, useContext } from 'react';

export interface ProfileGate {
  /** 내 프로필이 있는지 */
  hasProfile: boolean;
  /**
   * 프로필이 있어야 하는 행동 앞에서 호출해요.
   * 프로필이 있으면 true, 없으면 "프로필을 먼저 만들어 주세요" 모달을 띄우고 false.
   * @param action 모달 문구 앞부분 (예: '지원하려면', '자세히 보려면')
   */
  requireProfile: (action?: string) => boolean;
}

export const ProfileGateContext = createContext<ProfileGate>({ hasProfile: true, requireProfile: () => true });

export const useProfileGate = () => useContext(ProfileGateContext);
