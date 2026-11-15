// src/pages/project-form/CurrentTeamSection.tsx
import { ChipGroup } from '../../components/ui/Chip';
import { Stepper } from '../../components/ui/Stepper';
import { ROLES } from '../../constants/projectForm';
import { FieldLabel } from './FormParts';
import type { SectionProps } from './formModel';
import s from './FormSections.module.css';

interface CurrentTeamSectionProps extends SectionProps {
  /** 새 프로젝트일 때만 '내 역할'을 고를 수 있음 (등록 후에는 바꿀 수 없음) */
  isNew: boolean;
}

export function CurrentTeamSection({ form, update, isNew }: CurrentTeamSectionProps) {
  /** 내 역할을 바꾸면 현재 팀 인원에서도 본인 1명을 옮겨 줌 */
  const changeMyRole = (next: string) => {
    if (next === form.myRole) return;
    const team = { ...form.currentTeam };
    team[form.myRole] = Math.max(0, (team[form.myRole] ?? 0) - 1);
    team[next] = (team[next] ?? 0) + 1;
    update({ myRole: next, currentTeam: team });
  };

  return (
    <section className={s.section}>
      <h2 className={s.title}>현재 팀 정보</h2>
      <p className={s.desc}>이미 팀에 있는 인원을 역할별로 적어 주세요. 등록하는 본인도 포함해요.</p>

      <div className={s.field}>
        <FieldLabel hint={isNew ? '등록하면 이 역할의 팀장이 돼요' : '등록 후에는 바꿀 수 없어요'}>내 역할</FieldLabel>
        {isNew ? (
          <ChipGroup options={ROLES} value={form.myRole} onChange={changeMyRole} aria-label="내 역할" />
        ) : (
          <p className={s.desc}>{form.myRole}</p>
        )}
      </div>

      <div className={s.teamGrid}>
        {ROLES.map((role) => (
          <div key={role} className={s.teamCell}>
            <strong>{role}</strong>
            <Stepper
              value={form.currentTeam[role] ?? 0}
              min={0}
              max={9}
              onChange={(n) => update({ currentTeam: { ...form.currentTeam, [role]: n } })}
              aria-label={`현재 ${role} 인원`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
