// src/api/mappers/participation.ts
// 참여 요청(지원·제안) 서버 값 ↔ 화면 값, 에러 문구
import type { ParticipationKind, ParticipationStatus } from '../../types/participation';
import { ApiError } from '../client';
import { ERROR_CODE } from '../errors';
import type { ParticipationRequestStatus, ParticipationType } from '../participation';

export const kindOf = (type: ParticipationType): ParticipationKind => (type === 'OFFER' ? 'offer' : 'apply');

const STATUS: Record<ParticipationRequestStatus, ParticipationStatus> = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'declined',
  CANCELED: 'canceled',
};
export const statusOf = (status: ParticipationRequestStatus) => STATUS[status];

/** 지원·제안을 보내거나 처리하다 실패했을 때 안내 문구 */
export function participationErrorText(e: unknown, kind: ParticipationKind) {
  const word = kind === 'offer' ? '제안' : '지원';
  if (!(e instanceof ApiError)) return `${word}을 처리하지 못했어요. 잠시 후 다시 시도해 주세요`;
  switch (e.code) {
    case ERROR_CODE.PARTICIPATION_REQUEST_CONFLICT:
      return '이미 대기 중인 제안·지원이 있거나, 이미 팀원이거나, 이미 처리된 요청이에요';
    case ERROR_CODE.INVALID_PROJECT_STATE:
      return kind === 'apply' ? '지금은 모집 중이 아니라서 지원할 수 없어요' : '지금 프로젝트 상태에서는 처리할 수 없어요';
    case ERROR_CODE.PROJECT_ACCESS_DENIED:
      return '이 요청을 처리할 권한이 없어요';
    case ERROR_CODE.PROFILE_NOT_FOUND:
      return kind === 'apply' ? '프로필을 먼저 만들어 주세요' : '상대 프로필을 찾을 수 없어요';
    case ERROR_CODE.PROJECT_NOT_FOUND:
      return '더 이상 없는 프로젝트예요';
    case ERROR_CODE.PARTICIPATION_REQUEST_NOT_FOUND:
      return '이미 사라진 요청이에요';
    default:
      return e.message || `${word}을 처리하지 못했어요`;
  }
}
