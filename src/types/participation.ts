// src/types/participation.ts
import type { ContactType } from '../constants/contact';
import type { PersonSummary } from './person';
import type { MatchReason } from './recommendation';

/** 제안(offer) 또는 지원(apply) */
export type ParticipationKind = 'offer' | 'apply';

/** 진행 상태 (Pill 값과 같은 이름) */
export type ParticipationStatus = 'pending' | 'accepted' | 'declined' | 'canceled';

/** 내 입장에서 받은 건지 보낸 건지 */
export type ParticipationDirection = 'received' | 'sent';

export interface ParticipationProject {
  id: string;
  name: string;
  description: string;
  ownerName: string;
  summary: string; // "현재 팀 기획 1명, Backend 1명 | AI, 웹, 실사용 서비스"
}

export interface Participation {
  id: string;
  kind: ParticipationKind;
  direction: ParticipationDirection;
  status: ParticipationStatus;
  project: ParticipationProject;
  role: string;          // 모집 역할 (예: Backend)
  roleCondition: string; // 예: "1명 모집, 스택 무관"
  /** 상대방: 받은 제안=제안한 사람, 받은 지원=지원한 사람, 보낸 제안=제안받은 사람, 보낸 지원=프로젝트 등록자 */
  counterpart: PersonSummary;
  message: string;
  /** 받은 쪽이 수락·거절할 때 남긴 답장 */
  reply?: string;
  createdAt: string; // 2026-10-06
  /** 받은 내역: 열어 봤는지 / 보낸 내역: 상대 응답을 확인했는지 */
  read: boolean;
  matched: MatchReason[];
  unmatched: MatchReason[];
  /** 수락된 경우에만 공개되는 상대 연락처 */
  contact?: { type: ContactType; value: string };
}