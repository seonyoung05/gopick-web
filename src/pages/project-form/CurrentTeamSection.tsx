// src/pages/project-form/CurrentTeamSection.tsx
import { UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ProjectMember } from '../../api';
import { roleLabel } from '../../api/mappers/project';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { ChipGroup } from '../../components/ui/Chip';
import { Tag } from '../../components/ui/Label';
import { ROLES } from '../../constants/projectForm';
import { FieldLabel } from './FormParts';
import type { SectionProps } from './formModel';
import s from './FormSections.module.css';

interface CurrentTeamSectionProps extends SectionProps {
  /** 새 프로젝트일 때만 '내 역할'을 고를 수 있음 (등록 후에는 바꿀 수 없음) */
  isNew: boolean;
  /** 수정할 때 보여 줄 실제 팀원 (서버 값, 읽기 전용) */
  members?: ProjectMember[];
  /** 수정 중인 프로젝트 → "팀원 초대하기"에서 이 프로젝트를 미리 골라 둠 */
  projectId?: string;
}

export function CurrentTeamSection({ form, update, isNew, members = [], projectId }: CurrentTeamSectionProps) {
  const navigate = useNavigate();

  /** 등록할 때 팀원은 본인 1명뿐이라, 내 역할이 곧 현재 팀 구성이에요 */
  const changeMyRole = (next: string) => {
    update({
      myRole: next,
      currentTeam: Object.fromEntries(ROLES.map((r) => [r, r === next ? 1 : 0])),
    });
  };

  if (isNew) {
    return (
      <section className={s.section}>
        <h2 className={s.title}>현재 팀 정보</h2>
        <p className={s.desc}>등록하는 본인의 역할을 골라 주세요. 등록하면 이 역할의 팀장이 돼요.</p>

        <div className={s.field}>
          <FieldLabel>내 역할</FieldLabel>
          <ChipGroup options={ROLES} value={form.myRole} onChange={changeMyRole} aria-label="내 역할" />
        </div>

        <div className={s.infoBox}>
          <UserPlus size={20} aria-hidden="true" />
          <div>
            <strong>이미 함께하는 팀원이 있나요?</strong>
            <p>프로젝트를 등록한 뒤 참여 제안을 보내 초대해 주세요. 제안을 수락하면 팀원으로 합류해요.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={s.section}>
      <div className={s.sectionHead}>
        <div>
          <h2 className={s.title}>현재 팀 정보</h2>
          <p className={s.desc}>
            팀원 {members.length}명 · 참여 제안을 수락하거나 지원이 수락되면 여기에 추가돼요.
          </p>
        </div>
        {/* 사람 검색에서 참여 제안을 열면 이 프로젝트가 미리 골라져 있어요 */}
        <Button
          variant="ghost"
          size="sm"
          icon={<UserPlus size={16} aria-hidden="true" />}
          onClick={() => navigate(projectId ? `/search?invite=${projectId}` : '/search')}
        >
          팀원 초대하기
        </Button>
      </div>

      <ul className={s.memberList}>
        {members.map((m, i) => {
          const name = m.name ?? '비공개 프로필';
          // 탈퇴한 회원은 profileId가 null이라 순서로 구분
          const key = m.profileId ?? `left-${i}`;
          return (
            <li key={key} className={s.memberRow}>
              <Avatar name={name} seed={key} size="md" color={m.name ? undefined : 'muted'} />
              <strong>{name}</strong>
              <span className={s.memberRole}>{roleLabel(m.role)}</span>
              {m.authority === 'LEADER' && <Tag className={s.leaderTag}>팀장</Tag>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
