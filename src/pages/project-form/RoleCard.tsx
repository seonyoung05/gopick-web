// src/pages/project-form/RoleCard.tsx
import { ChipGroup } from '../../components/ui/Chip';
import { LevelSelect } from '../../components/ui/LevelSelect';
import { Segment } from '../../components/ui/Segment';
import { Stepper } from '../../components/ui/Stepper';
import { REQUIRED_LEVELS } from '../../constants/levels';
import {
  CONDITIONS,
  ROLE_CONDITION_HELP,
  TECH_STACKS,
  type Condition,
} from '../../constants/projectForm';
import { FieldError } from './FormParts';
import type { RoleDetail } from './formModel';
import s from './FormSections.module.css';

interface RoleCardProps {
  role: string;
  detail: RoleDetail;
  onChange: (next: RoleDetail) => void;
  showErrors: boolean;
}

/** 모집 역할 하나의 인원과 기술 조건 */
export function RoleCard({ role, detail, onChange, showErrors }: RoleCardProps) {
  const needsTech = detail.condition !== '상관없음';

  const setTechs = (techs: string[]) => {
    // 새로 고른 기술은 기본 수준을 채우고, 해제한 기술의 수준은 지움
    const levels = Object.fromEntries(
      techs.map((t) => [t, detail.levels[t] ?? REQUIRED_LEVELS[0].value]),
    );
    onChange({ ...detail, techs, levels });
  };

  return (
    <div className={s.roleCard}>
      <div className={s.roleHead}>
        <strong>{role}</strong>
        <Stepper
          value={detail.count}
          min={1}
          max={9}
          onChange={(count) => onChange({ ...detail, count })}
          aria-label={`${role} 모집 인원`}
        />
      </div>

      <p className={s.subLabel}>기술 조건</p>
      <Segment<Condition>
        options={CONDITIONS}
        value={detail.condition}
        onChange={(condition) => onChange({ ...detail, condition })}
        aria-label={`${role} 기술 조건`}
      />
      <p className={s.help}>{ROLE_CONDITION_HELP[detail.condition]}</p>

      {needsTech && (
        <>
          <ChipGroup
            multiple
            options={TECH_STACKS}
            value={detail.techs}
            onChange={setTechs}
            aria-label={`${role} 기술 스택`}
          />
          <FieldError show={showErrors && detail.techs.length === 0}>기술을 하나 이상 골라 주세요.</FieldError>

          {detail.techs.map((tech) => (
            <div key={tech} className={s.levelRow}>
              <strong>{tech}</strong>
              <LevelSelect
                options={REQUIRED_LEVELS}
                value={detail.levels[tech] ?? null}
                onChange={(level) => onChange({ ...detail, levels: { ...detail.levels, [tech]: level } })}
                aria-label={`${role} ${tech} 요구 수준`}
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
}
