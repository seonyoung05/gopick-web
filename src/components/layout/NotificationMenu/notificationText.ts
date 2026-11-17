// src/components/layout/NotificationMenu/notificationText.ts
// 알림 종류별 아이콘 · 색 · 문구
import {
  CheckCircle2,
  Crown,
  Flag,
  Inbox,
  Rocket,
  Send,
  Trash2,
  UserMinus,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import type { NotificationResponse, NotificationType } from '../../../api';

export type Tone = 'blue' | 'violet' | 'green' | 'yellow' | 'gray' | 'red';

/** t = '프로젝트명', who = "김수뭉 님" 또는 null(이름을 모를 때) */
type TextFn = (t: string, who: string | null) => string;

export const KIND: Record<NotificationType, { icon: LucideIcon; tone: Tone; text: TextFn }> = {
  APPLY_RECEIVED: {
    icon: Inbox,
    tone: 'blue',
    text: (t, who) => (who ? `${who}이 ${t}에 지원했어요` : `${t}에 새 지원이 왔어요`),
  },
  OFFER_RECEIVED: {
    icon: Send,
    tone: 'violet',
    text: (t, who) => (who ? `${who}이 ${t} 팀에 참여를 제안했어요` : `${t} 팀에서 참여 제안이 왔어요`),
  },
  APPLY_ACCEPTED: { icon: CheckCircle2, tone: 'green', text: (t) => `${t} 지원이 수락됐어요. 팀에 합류했어요` },
  APPLY_REJECTED: { icon: XCircle, tone: 'gray', text: (t) => `${t} 지원이 거절됐어요` },
  OFFER_ACCEPTED: {
    icon: CheckCircle2,
    tone: 'green',
    text: (t, who) => (who ? `${who}이 ${t} 참여 제안을 수락했어요` : `보낸 참여 제안이 수락됐어요 · ${t}`),
  },
  OFFER_REJECTED: {
    icon: XCircle,
    tone: 'gray',
    text: (t, who) => (who ? `${who}이 ${t} 참여 제안을 거절했어요` : `보낸 참여 제안이 거절됐어요 · ${t}`),
  },
  LEADER_TRANSFERRED: {
    icon: Crown,
    tone: 'yellow',
    text: (t, who) => (who ? `${who}이 ${t}의 팀장을 넘겨줬어요` : `${t}의 팀장이 됐어요`),
  },
  PROJECT_STARTED: { icon: Rocket, tone: 'blue', text: (t) => `${t} 프로젝트가 시작됐어요` },
  PROJECT_COMPLETED: { icon: Flag, tone: 'green', text: (t) => `${t} 프로젝트가 완료됐어요` },
  PROJECT_STAGE_CHANGED: { icon: Flag, tone: 'blue', text: (t) => `${t}의 진행 단계가 바뀌었어요` },
  MEMBER_LEFT: {
    icon: UserMinus,
    tone: 'gray',
    text: (t, who) => (who ? `${who}이 ${t}에서 나갔어요` : `팀원 한 명이 ${t}에서 나갔어요`),
  },
  PROJECT_DELETED: { icon: Trash2, tone: 'red', text: (t) => `${t} 프로젝트가 삭제됐어요` },
};

export const notificationText = (n: NotificationResponse) =>
  KIND[n.type].text(`'${n.projectTitle}'`, n.actorName ? `${n.actorName} 님` : null);

/** 받은 요청 / 보낸 요청 알림 */
export const RECEIVED_TYPES: readonly NotificationType[] = ['APPLY_RECEIVED', 'OFFER_RECEIVED'];
export const SENT_TYPES: readonly NotificationType[] = [
  'APPLY_ACCEPTED',
  'APPLY_REJECTED',
  'OFFER_ACCEPTED',
  'OFFER_REJECTED',
];

/** "방금", "3분 전", "2시간 전", "11/14" */
export function timeAgo(iso: string, now = Date.now()) {
  const diff = (now - new Date(iso).getTime()) / 60000;
  if (diff < 1) return '방금';
  if (diff < 60) return `${Math.floor(diff)}분 전`;
  if (diff < 60 * 24) return `${Math.floor(diff / 60)}시간 전`;
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, '0')}`;
}
