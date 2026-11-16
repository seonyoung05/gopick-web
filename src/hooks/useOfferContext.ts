// src/hooks/useOfferContext.ts
// 사람 카드에서 "참여 제안 보내기"에 필요한 것들을 한곳에서:
// - 제안할 수 있는 내 프로젝트 (GET /me/projects 중 내가 팀장 + 완료 전 + 모집 역할 있음)
// - 사람별 관계 (내가 보낸 대기 중 제안 → offered, 내 프로젝트에 온 대기 중 지원 → applied)
// - 제안 보내기
import { useCallback, useEffect, useState } from 'react';
import { participationApi, projectsApi, type ProjectRole } from '../api';
import { roleLabel } from '../api/mappers/project';
import type { OfferPayload } from '../components/common/OfferModal';
import type { MyRecruitingProject } from '../types/participation';
import type { RecommendRelation } from '../types/recommendation';

export function useOfferContext() {
  const [projects, setProjects] = useState<MyRecruitingProject[]>([]);
  const [offered, setOffered] = useState<Set<string>>(new Set());
  const [applied, setApplied] = useState<Set<string>>(new Set());

  useEffect(() => {
    let ignore = false;

    projectsApi
      .myProjects()
      .then((list) => {
        if (ignore) return;
        setProjects(
          list
            .filter((p) => p.myAuthority === 'LEADER' && p.lifecycleStatus !== 'COMPLETED')
            .map((p) => ({
              id: String(p.projectId),
              name: p.title,
              recruitments: p.recruitments.map((r) => ({
                recruitmentId: r.role,
                role: roleLabel(r.role),
                remaining: r.remainingCount,
              })),
            }))
            .filter((p) => p.recruitments.length > 0),
        );
      })
      .catch(() => undefined); // 실패하면 "모집 중인 내 프로젝트가 없어요"로 보임

    Promise.all([participationApi.sent(), participationApi.received()])
      .then(([sent, received]) => {
        if (ignore) return;
        setOffered(
          new Set(
            sent
              .filter((r) => r.type === 'OFFER' && r.status === 'PENDING')
              .map((r) => String(r.participantProfileId)),
          ),
        );
        setApplied(
          new Set(
            received
              .filter((r) => r.type === 'APPLY' && r.status === 'PENDING')
              .map((r) => String(r.participantProfileId)),
          ),
        );
      })
      .catch(() => undefined);

    return () => {
      ignore = true;
    };
  }, []);

  const relationOf = useCallback(
    (personId: string): RecommendRelation =>
      applied.has(personId) ? 'applied' : offered.has(personId) ? 'offered' : 'none',
    [applied, offered],
  );

  /** 제안 보내기. 실패하면 에러를 그대로 던짐 (화면에서 토스트) */
  const sendOffer = useCallback(async (payload: OfferPayload) => {
    await participationApi.create(Number(payload.projectId), {
      type: 'OFFER',
      role: payload.recruitmentId as ProjectRole,
      targetProfileId: Number(payload.personId),
    });
    setOffered((prev) => new Set(prev).add(payload.personId));
  }, []);

  return { projects, relationOf, sendOffer };
}
