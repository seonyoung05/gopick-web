// src/pages/inbox/inboxText.ts
import type { Participation } from '../../types/participation';

const kindText = (p: Participation) => (p.kind === 'offer' ? '제안' : '지원');

/** 상세에 프로젝트 정보를 보여 줄지 (받은 제안, 보낸 지원) 사람 정보를 보여 줄지 */
export const showsProject = (p: Participation) =>
  (p.direction === 'received' && p.kind === 'offer') || (p.direction === 'sent' && p.kind === 'apply');

/** 10/06, 9/24 형태 */
export const shortDate = (iso: string) => {
  const [, m, d] = iso.split('-');
  return `${Number(m)}/${d}`;
};

/* ---------- 목록 ---------- */
export const itemTitle = (p: Participation) =>
  p.direction === 'sent' && p.kind === 'apply' ? p.project.name : p.counterpart.name;

export function itemSub(p: Participation) {
  if (p.direction === 'received') {
    return p.kind === 'offer' ? `${p.project.name}, ${p.role} 역할 제안` : `${p.project.name}에 ${p.role}로 지원`;
  }
  return p.kind === 'offer' ? `${p.project.name}에 ${p.role} 제안` : `${p.role} 역할로 지원`;
}

/* ---------- 상세 ---------- */
export function detailTitle(p: Participation) {
  const name = p.counterpart.name;
  const project = p.project.name;
  if (p.direction === 'received') {
    return p.kind === 'offer' ? `${name} 님이 ${project} 팀에 참여를 제안했어요` : `${name} 님이 ${project}에 지원했어요`;
  }
  return p.kind === 'offer' ? `${name} 님에게 ${project} 참여를 제안했어요` : `${project}에 지원했어요`;
}

export function detailSub(p: Participation) {
  const parts = [`${p.role} 역할`];
  if (p.direction === 'sent' && p.kind === 'apply') parts.push(`등록자 ${p.project.ownerName}`);
  parts.push(shortDate(p.createdAt));
  return parts.join(' | ');
}

export const messageLabel = (p: Participation) =>
  p.direction === 'received' ? `${p.counterpart.name} 님의 메시지` : '내가 보낸 메시지';

export const replyLabel = (p: Participation) =>
  p.direction === 'received' ? '내 답장' : `${p.counterpart.name} 님의 답장`;

/** 상태별 안내 문구 */
export function noteText(p: Participation) {
  const name = p.counterpart.name;
  const kind = kindText(p);

  if (p.status === 'pending') {
    if (p.direction === 'received') {
      return p.kind === 'offer'
        ? `수락하면 ${p.project.name} 팀에 합류하고, ${name} 님과 서로의 연락처가 공개돼요.`
        : `수락하면 ${name} 님이 팀원으로 추가되고 ${p.role} 모집 인원이 1명 줄어요. 서로의 연락처도 공개돼요.`;
    }
    return p.kind === 'offer'
      ? '상대가 아직 답하지 않았어요. 수락되면 서로의 연락처가 공개돼요.'
      : `등록자가 수락하면 팀에 합류하고, ${p.project.ownerName} 님과 서로의 연락처가 공개돼요.`;
  }
  if (p.status === 'accepted') {
    return p.kind === 'offer' && p.direction === 'received'
      ? `${p.project.name} 팀에 합류했어요.`
      : '수락된 ' + kind + '이에요. 아래 연락처로 연락해 보세요.';
  }
  if (p.status === 'declined') {
    return p.direction === 'received'
      ? `거절한 ${kind}이에요.`
      : `거절된 ${kind}이에요. 같은 방향으로는 다시 보낼 수 없어요.`;
  }
  return p.direction === 'sent' ? `취소한 ${kind}이에요. 필요하면 다시 보낼 수 있어요.` : `상대가 취소한 ${kind}이에요.`;
}