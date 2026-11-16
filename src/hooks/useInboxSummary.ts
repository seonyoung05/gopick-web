// src/hooks/useInboxSummary.ts
// 제안·지원 "새 소식" 개수 (탑바 알림, 사이드바 배지, 홈 배너)
// 서버에 읽음 표시가 없어서 제안·지원함과 같은 규칙(이 브라우저에 저장한 읽음 기록)으로 세요.
//  - 받은 요청: 대기 중이고 아직 열어 보지 않은 것
//  - 보낸 요청: 상대가 수락·거절했는데 아직 확인하지 않은 것
import { useEffect, useState } from 'react';
import { participationApi, type ParticipationRequestResponse } from '../api';
import { statusOf } from '../api/mappers/participation';
import { isRead, loadSeen } from '../pages/inbox/seenStore';
import type { ParticipationDirection } from '../types/participation';

export interface InboxSummary {
  /** 새 소식 전체 */
  total: number;
  /** 아직 안 본 받은 참여 제안 */
  receivedOffers: number;
  /** 아직 안 본 내 프로젝트 지원 */
  receivedApplies: number;
}

const EMPTY: InboxSummary = { total: 0, receivedOffers: 0, receivedApplies: 0 };

const unread = (list: ParticipationRequestResponse[], direction: ParticipationDirection, seen: Set<string>) =>
  list.filter((r) => !isRead({ id: String(r.requestId), status: statusOf(r.status), direction }, seen));

/** refreshKey가 바뀔 때마다 다시 셈 (예: 화면 이동) */
export function useInboxSummary(refreshKey?: unknown): InboxSummary {
  const [summary, setSummary] = useState<InboxSummary>(EMPTY);

  useEffect(() => {
    let ignore = false;
    Promise.all([participationApi.received(), participationApi.sent()])
      .then(([received, sent]) => {
        if (ignore) return;
        const seen = loadSeen();
        const newReceived = unread(received, 'received', seen);
        const newSent = unread(sent, 'sent', seen);
        setSummary({
          total: newReceived.length + newSent.length,
          receivedOffers: newReceived.filter((r) => r.type === 'OFFER').length,
          receivedApplies: newReceived.filter((r) => r.type === 'APPLY').length,
        });
      })
      .catch(() => undefined); // 실패하면 0으로 둠 (배지만 안 보임)
    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  return summary;
}
