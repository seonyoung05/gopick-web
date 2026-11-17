// src/api/notifications.ts
// 내 알림 (서버 docs/notification-api.md)
import { api } from './client';

export type NotificationType =
  | 'APPLY_RECEIVED'
  | 'OFFER_RECEIVED'
  | 'APPLY_ACCEPTED'
  | 'APPLY_REJECTED'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'LEADER_TRANSFERRED'
  | 'PROJECT_STARTED'
  | 'PROJECT_COMPLETED'
  | 'PROJECT_STAGE_CHANGED'
  | 'MEMBER_LEFT'
  | 'PROJECT_DELETED';

export interface NotificationResponse {
  id: number;
  type: NotificationType;
  projectId: number;
  /** 알림이 생긴 때의 프로젝트 이름 */
  projectTitle: string;
  /** 지원·제안 알림일 때 요청 번호 (그 밖에는 null) */
  requestId: number | null;
  /** 그 요청을 지금 제안·지원함에서 볼 수 있는지 (지원·제안 알림이 아니면 null) */
  requestAvailable: boolean | null;
  /** 알림을 일으킨 사람의 지금 공개 이름 (비공개·탈퇴·예전 알림은 null) */
  actorName: string | null;
  createdAt: string;
  read: boolean;
  readAt: string | null;
}

export const notificationsApi = {
  /** 내 알림 (최신순) */
  list: () => api.get<NotificationResponse[]>('/me/notifications'),
  /** 읽음 처리 (204, 이미 읽었어도 204) */
  read: (id: number) => api.patch<void>(`/me/notifications/${id}/read`),
};
