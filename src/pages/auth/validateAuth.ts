// src/pages/auth/validateAuth.ts
import { ApiError, ERROR_CODE } from '../../api';
import type { AccountResponse } from '../../api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** 백엔드 규칙: 8자 이상, 영문 1자 이상, 숫자 1자 이상 */
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const PASSWORD_HELP = '8자 이상, 영문과 숫자를 함께 써 주세요.';

export function emailError(email: string) {
  if (!email.trim()) return '이메일을 입력해 주세요.';
  if (!EMAIL_RE.test(email.trim())) return '이메일 형식을 확인해 주세요. (예: name@example.com)';
  return undefined;
}

export function newPasswordError(password: string) {
  if (!password) return '비밀번호를 입력해 주세요.';
  if (!PASSWORD_RE.test(password)) return '비밀번호 규칙을 확인해 주세요. ' + PASSWORD_HELP;
  return undefined;
}

/** 서버 에러 → 화면 문구 (code 기준으로 구분) */
export function authErrorMessage(err: unknown, fallback: string) {
  if (!(err instanceof ApiError)) return fallback;
  switch (err.code) {
    case ERROR_CODE.INVALID_CREDENTIALS:
      return '이메일 또는 비밀번호가 맞지 않아요. 다시 확인해 주세요.';
    case ERROR_CODE.DUPLICATE_EMAIL:
      return '이미 가입된 이메일이에요. 로그인해 주세요.';
    case ERROR_CODE.NETWORK_ERROR:
      return '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.';
    case ERROR_CODE.VALIDATION_ERROR:
      return '입력한 내용을 다시 확인해 주세요.';
    default:
      return fallback;
  }
}

/** 로그인·가입 후 갈 곳: 프로필 없으면 내 프로필, 있으면 원래 가려던 곳(없으면 홈) */
export function pathAfterAuth(account: AccountResponse | null, from?: string) {
  if (!account?.profileId) return '/profile';
  return from ?? '/';
}