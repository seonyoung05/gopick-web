// src/stores/auth/avatarSeed.ts
import type { AccountResponse } from '../../api';

/** 내 아바타 색 기준: 프로필이 있으면 profileId, 없으면 계정 ID */
export function myAvatarSeed(account: AccountResponse | null) {
  if (!account) return undefined;
  return account.profileId ?? `account-${account.accountId}`;
}