// src/pages/project-form/CurrentTeamSection.tsx
import { Stepper } from '../../components/ui/Stepper';
import { ROLES } from '../../constants/projectForm';
import type { SectionProps } from './formModel';
import s from './FormSections.module.css';

export function CurrentTeamSection({ form, update }: SectionProps) {
  return (
    <section className={s.section}>
      <h2 className={s.title}>현재 팀 정보</h2>
      <p className={s.desc}>이미 팀에 있는 인원을 역할별로 적어 주세요. 등록하는 본인도 포함해요.</p>

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
