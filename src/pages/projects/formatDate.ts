// src/pages/projects/formatDate.ts
/** 활동 기록에 쓰는 'MM/DD' 모양 (예: 10/06) */
export function monthDay(date: Date = new Date()): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${mm}/${dd}`;
}

/** '최근 활동'에 쓰는 앞자리 0 없는 모양 (예: 10/6) — 기존 목업 데이터와 같은 형식 */
export function monthDayShort(date: Date = new Date()): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
