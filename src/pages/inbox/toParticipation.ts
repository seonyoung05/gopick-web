// src/pages/inbox/toParticipation.ts
// 서버 참여 요청 + (프로젝트 상세, 상대 프로필) → 제안·지원함 카드 데이터
import type { ParticipationRequestResponse, ProjectDetail } from '../../api';
import { kindOf, statusOf } from '../../api/mappers/participation';
import { roleLabel, skillText, teamText } from '../../api/mappers/project';
import { TECH_LEVELS } from '../../constants/levels';
import type { Participation, ParticipationDirection } from '../../types/participation';
import type { PersonSummary } from '../../types/person';
import type { MatchReason } from '../../types/recommendation';

/** 상대가 누구인지: 받은 지원=지원자, 받은 제안=제안한 팀장, 보낸 제안=제안받은 사람, 보낸 지원=프로젝트 팀장 */
export function counterpartIdOf(
  req: ParticipationRequestResponse,
  direction: ParticipationDirection,
  project?: ProjectDetail,
): number | undefined {
  if (direction === 'received') return req.type === 'APPLY' ? req.participantProfileId : req.senderProfileId;
  if (req.type === 'OFFER') return req.participantProfileId;
  return project?.members.find((m) => m.authority === 'LEADER')?.profileId ?? undefined;
}

/** 프로필을 못 불러올 때(비공개 등) 쓰는 이름만 있는 사람 */
export const unknownPerson = (id: number | undefined, name = '비공개 프로필'): PersonSummary => ({
  id: String(id ?? 'unknown'),
  name,
  major: '',
  isPublic: false,
  roles: [],
  skills: [],
  fields: [],
  tendencies: [],
  collab: [],
  intro: '',
});

const levelIndex = (label: string) => TECH_LEVELS.findIndex((l) => l.value === label) + 1; // 1~4

/** 사람 ↔ 프로젝트 모집 조건 일치·불일치 (역할 · 기술 · 관심 분야 · 협업 성향) */
function fitBetween(person: PersonSummary, project: ProjectDetail | undefined, role: string) {
  const matched: MatchReason[] = [];
  const unmatched: MatchReason[] = [];
  if (!person.isPublic) return { matched, unmatched };

  // 화면(FitLists)이 "희망 역할:" 같은 항목 이름을 앞에 붙여 줘서 값만 넣어요
  if (person.roles.includes(role)) matched.push({ category: 'role', text: role });
  else unmatched.push({ category: 'role', text: `${role} 희망 안 함` });

  if (!project) return { matched, unmatched };

  const recruitment = project.recruitments.find((r) => roleLabel(r.role) === role);
  if (recruitment && recruitment.techMode !== 'NONE') {
    for (const t of recruitment.technologies) {
      const skill = person.skills.find((s) => s.stack.toLowerCase() === t.technology.toLowerCase());
      if (skill && levelIndex(skill.level) >= t.minLevel) {
        matched.push({ category: 'stack', text: `${t.technology} ${skill.level}` });
      } else {
        unmatched.push({ category: 'stack', text: skill ? `${t.technology} 수준 부족` : `${t.technology} 경험 없음` });
      }
    }
  }

  const fields = project.attributes.filter((a) => a.category === 'FIELD').map((a) => a.value);
  const sameFields = fields.filter((f) => person.fields.includes(f));
  if (sameFields.length > 0) matched.push({ category: 'field', text: sameFields.join(', ') });
  else if (fields.length > 0) unmatched.push({ category: 'field', text: `${fields.join(', ')} 관심 없음` });

  const collab = project.attributes.filter((a) => a.category === 'COLLAB').map((a) => a.value);
  const sameCollab = collab.filter((c) => person.collab.includes(c));
  if (sameCollab.length > 0) matched.push({ category: 'collab', text: sameCollab.join(', ') });

  return { matched, unmatched };
}

export function toParticipation(
  req: ParticipationRequestResponse,
  direction: ParticipationDirection,
  ctx: { project?: ProjectDetail; counterpart: PersonSummary; read: boolean },
): Participation {
  const { project, counterpart } = ctx;
  const role = roleLabel(req.role);
  const leader = project?.members.find((m) => m.authority === 'LEADER');
  const recruitment = project?.recruitments.find((r) => r.role === req.role);
  const fields = project?.attributes.filter((a) => a.category !== 'COLLAB').map((a) => a.value) ?? [];
  const fit = fitBetween(counterpart, project, role);

  return {
    id: String(req.requestId),
    kind: kindOf(req.type),
    direction,
    status: statusOf(req.status),
    project: {
      id: String(req.projectId),
      name: req.projectTitle,
      description: project?.description ?? '',
      ownerName: leader?.name ?? '비공개 프로필',
      summary: project
        ? [`현재 팀 ${teamText(project)}`, fields.join(', ')].filter(Boolean).join(' | ')
        : '',
    },
    role,
    roleCondition: recruitment ? `${recruitment.remainingCount}명 모집, ${skillText(recruitment)}` : '모집 조건 없음',
    counterpart,
    message: '', // 서버가 아직 메시지를 받지 않음
    createdAt: req.createdAt,
    read: ctx.read,
    matched: fit.matched,
    unmatched: fit.unmatched,
  };
}
