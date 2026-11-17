// src/hooks/useInboxSummary.ts
// 내가 답해야 하는 요청 수 (사이드바 '제안·지원' 배지, 홈 배너)
//  - 받은 요청 중 아직 대기 중인 것 = 수락·거절이 필요한 것
// "새 소식"(상대가 답했어요, 단계가 바뀌었어요 등)은 탑바 🔔 알림(서버 알림 API)이 맡아요.
import { useEffect, useState } from 'react';
import { participationApi } from '../api';

export interface InboxSummary {
  /** 답을 기다리는 받은 요청 전체 */
  total: number;
  /** 답을 기다리는 받은 참여 제안 */
  receivedOffers: number;
  /** 답을 기다리는 내 프로젝트 지원 */
  receivedApplies: number;
}

const EMPTY: InboxSummary = { total: 0, receivedOffers: 0, receivedApplies: 0 };

/** refreshKey가 바뀔 때마다 다시 셈 (예: 화면 이동) */
export function useInboxSummary(refreshKey?: unknown): InboxSummary {
  const [summary, setSummary] = useState<InboxSummary>(EMPTY);

  useEffect(() => {
    let ignore = false;
    participationApi
      .received()
      .then((received) => {
        if (ignore) return;
        const pending = received.filter((r) => r.status === 'PENDING');
        setSummary({
          total: pending.length,
          receivedOffers: pending.filter((r) => r.type === 'OFFER').length,
          receivedApplies: pending.filter((r) => r.type === 'APPLY').length,
        });
      })
      .catch(() => undefined); // 실패하면 0으로 둠 (배지만 안 보임)
    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  return summary;
}
