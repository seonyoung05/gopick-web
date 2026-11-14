// src/pages/project-form/RecruitSection.tsx
import { ChipGroup } from '../../components/ui/Chip';
import { Input } from '../../components/ui/Input';
import { Segment } from '../../components/ui/Segment';
import {
  CONDITIONS,
  EXPERIENCE_HELP,
  ROLES,
  TEAM_SIZES,
  type Condition,
} from '../../constants/projectForm';
import { FieldError, FieldLabel } from './FormParts';
import { RoleCard } from './RoleCard';
import { emptyRoleDetail, type SectionProps } from './formModel';
import s from './FormSections.module.css';

export function RecruitSection({ form, update, showErrors }: SectionProps) {
  const setRoles = (roles: string[]) => {
    // 새로 고른 역할은 기본값을 만들고, 해제한 역할의 설정은 지움
    const roleDetails = Object.fromEntries(
      roles.map((r) => [r, form.roleDetails[r] ?? emptyRoleDetail()]),
    );
    update({ roles, roleDetails });
  };

  return (
    <section className={s.section}>
      <h2 className={s.title}>모집 조건</h2>
      <p className={s.desc}>모집할 역할을 고르면 역할마다 인원과 기술 조건을 정할 수 있어요.</p>

      <div className={s.field}>
        <FieldLabel hint="본인 포함 전체 인원 · 앞 값을 누르면 범위로 선택돼요 (예: 4~5명)">
          목표 팀 규모
        </FieldLabel>
        <ChipGroup
          multiple
          options={TEAM_SIZES}
          value={form.teamSizes}
          onChange={(teamSizes) => update({ teamSizes })}
          aria-label="목표 팀 규모"
        />
      </div>

      <div className={s.field}>
        <FieldLabel required hint="복수 선택">모집 역할</FieldLabel>
        <ChipGroup
          multiple
          options={ROLES}
          value={form.roles}
          onChange={setRoles}
          aria-label="모집 역할"
        />
        <FieldError show={showErrors && form.roles.length === 0}>모집할 역할을 하나 이상 골라 주세요.</FieldError>
      </div>

      <div className={s.field}>
        <FieldLabel required>역할별 인원과 기술 조건</FieldLabel>
        {form.roles.length === 0 ? (
          <p className={s.empty}>모집할 역할을 먼저 선택해 주세요.</p>
        ) : (
          <div className={s.roleList}>
            {form.roles.map((role) => (
              <RoleCard
                key={role}
                role={role}
                detail={form.roleDetails[role]}
                showErrors={showErrors}
                onChange={(next) => update({ roleDetails: { ...form.roleDetails, [role]: next } })}
              />
            ))}
          </div>
        )}
      </div>

      <div className={s.field}>
        <FieldLabel hint="구성원의 프로젝트 경험을 추천에 반영할지 정해요">프로젝트 경험 조건</FieldLabel>
        <Segment<Condition>
          options={CONDITIONS}
          value={form.experience}
          onChange={(experience) => update({ experience })}
          aria-label="프로젝트 경험 조건"
        />
        <p className={s.help}>{EXPERIENCE_HELP[form.experience]}</p>
      </div>

      <div className={s.field}>
        <FieldLabel htmlFor="pf-extra">추가 모집 설명</FieldLabel>
        <Input
          id="pf-extra"
          placeholder="예: 초보자 참여 가능, 디자인 경험 우대"
          value={form.extraNote}
          onChange={(e) => update({ extraNote: e.target.value })}
        />
      </div>
    </section>
  );
}
