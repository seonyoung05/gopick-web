// src/api/participation.ts
// 프로젝트 참여 요청: 지원(APPLY) · 제안(OFFER)
import { api } from './client';
import type { ProjectRole } from './projects';

export type ParticipationType = 'APPLY' | 'OFFER';
export type ParticipationRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';

/** 생성·처리·목록 응답 공통 */
export interface ParticipationRequestResponse {
  requestId: number;
  projectId: number;
  projectTitle: string;
  type: ParticipationType;
  /** 수락되면 이 역할로 팀원이 됨 */
  role: ProjectRole;
  status: ParticipationRequestStatus;
  senderProfileId: number;
  /** 수락되면 팀에 들어갈 사람 (지원: 지원자, 제안: 제안받은 사람) */
  participantProfileId: number;
  createdAt: string;
  resolvedAt: string | null;
}

export type ParticipationCreateRequest =
  | { type: 'APPLY'; role: ProjectRole }
  | { type: 'OFFER'; role: ProjectRole; targetProfileId: number };

/** 받은 쪽: ACCEPTED / REJECTED, 보낸 쪽: CANCELED */
export type ParticipationResolveStatus = Exclude<ParticipationRequestStatus, 'PENDING'>;

export const participationApi = {
  /** 지원하기 · 참여 제안 보내기 (201) */
  create: (projectId: number, body: ParticipationCreateRequest) =>
    api.post<ParticipationRequestResponse>(`/projects/${projectId}/participation-requests`, body),

  /** 수락 · 거절 · 취소 */
  resolve: (projectId: number, requestId: number, status: ParticipationResolveStatus) =>
    api.patch<ParticipationRequestResponse>(`/projects/${projectId}/participation-requests/${requestId}`, {
      status,
    }),

  /** 내가 보낸 지원·제안 (최신순) */
  sent: () => api.get<ParticipationRequestResponse[]>('/me/participation-requests/sent'),
  /** 내 프로젝트에 온 지원 + 나에게 온 제안 (최신순) */
  received: () => api.get<ParticipationRequestResponse[]>('/me/participation-requests/received'),
};
