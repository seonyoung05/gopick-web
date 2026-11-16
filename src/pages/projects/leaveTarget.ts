// src/pages/projects/leaveTarget.ts
import type { ProjectData } from '../../api';
import { myMembership, roleLabel } from '../../api/mappers/project';

export interface LeaveCandidate {
  profileId: number;
  name: string;
  role: string;
}

/** 나가기 모달이 필요로 하는 프로젝트 정보 */
export interface LeaveTarget {
  title: string;
  /** recruiting: 모집 중(준비 중) · ongoing: 진행 중 */
  phase: 'recruiting' | 'ongoing';
  isLeader: boolean;
  /** 팀장을 넘길 수 있는 다른 팀원 */
  candidates: LeaveCandidate[];
}

/** 서버에서 받은 프로젝트 → 나가기 모달 정보. 팀원이 아니거나 완료된 프로젝트면 null */
export function toLeaveTarget(p: ProjectData, myProfileId: number | null | undefined): LeaveTarget | null {
  const { isMember, isLeader } = myMembership(p, myProfileId);
  if (!isMember) return null;
  if (p.lifecycleStatus !== 'PREPARING' && p.lifecycleStatus !== 'IN_PROGRESS') return null;
  return {
    title: p.title,
    phase: p.lifecycleStatus === 'PREPARING' ? 'recruiting' : 'ongoing',
    isLeader,
    candidates: p.members.flatMap((m) =>
      m.profileId == null || m.profileId === myProfileId
        ? []
        : [{ profileId: m.profileId, name: m.name ?? '비공개 프로필', role: roleLabel(m.role) }],
    ),
  };
}
