// src/pages/inbox/seenStore.ts
// "새 소식" 점(읽음 표시)은 서버에 없어서 이 브라우저에만 저장해요.
// 키는 "요청ID:상태" → 보낸 요청에 상대가 답하면(상태가 바뀌면) 다시 새 소식이 돼요.
import type { Participation } from '../../types/participation';

const KEY = 'gopick:inbox-seen';
const MAX = 500;

export const seenKey = (p: Pick<Participation, 'id' | 'status'>) => `${p.id}:${p.status}`;

export function loadSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function saveSeen(seen: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...seen].slice(-MAX)));
  } catch {
    // 저장 못 해도 화면은 그대로 동작
  }
}

/** 받은 요청은 대기 중일 때, 보낸 요청은 상대가 답했을 때만 새 소식 */
export function isRead(p: Pick<Participation, 'id' | 'status' | 'direction'>, seen: Set<string>) {
  if (seen.has(seenKey(p))) return true;
  return p.direction === 'received' ? p.status !== 'pending' : p.status === 'pending';
}
