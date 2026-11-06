// src/pages/profile/ExperienceCard.tsx
import { Field } from '../../components/common/Field';
import { EtcChipGroup } from '../../components/common/EtcChipGroup';
import { Textarea } from '../../components/ui/Input';
import { EXPERIENCE_TYPES, EXPERIENCE_FIELDS, ROLES, TECH_STACKS } from '../../constants/options';
import type { Experience } from '../../types/profile';
import styles from './ProfilePage.module.css';

interface ExperienceCardProps {
  index: number;
  experience: Experience;
  onChange: (patch: Partial<Experience>) => void;
  onRemove: () => void;
}

export function ExperienceCard({ index, experience: exp, onChange, onRemove }: ExperienceCardProps) {
  return (
    <div className={styles.expCard}>
      <div className={styles.expHead}>
        <strong>경험 {index + 1}</strong>
        <button type="button" className={styles.textButton} onClick={onRemove}>
          삭제
        </button>
      </div>

      <Field label="경험 유형" hint="복수 선택">
        <EtcChipGroup
          options={EXPERIENCE_TYPES}
          value={exp.types}
          onChange={(v) => onChange({ types: v })}
          etcValue={exp.typeEtc}
          onEtcChange={(v) => onChange({ typeEtc: v })}
          etcPlaceholder="경험 유형 직접 입력 (예: 동아리 스터디)"
          aria-label={`경험 ${index + 1} 유형`}
        />
      </Field>

      <Field label="경험 분야" hint="복수 선택">
        <EtcChipGroup
          options={EXPERIENCE_FIELDS}
          value={exp.fields}
          onChange={(v) => onChange({ fields: v })}
          etcValue={exp.fieldEtc}
          onEtcChange={(v) => onChange({ fieldEtc: v })}
          etcPlaceholder="경험 분야 직접 입력"
          aria-label={`경험 ${index + 1} 분야`}
        />
      </Field>

      <Field label="담당 역할" hint="복수 선택">
        <EtcChipGroup
          options={ROLES}
          value={exp.roles}
          onChange={(v) => onChange({ roles: v })}
          etcValue={exp.roleEtc}
          onEtcChange={(v) => onChange({ roleEtc: v })}
          etcPlaceholder="담당 역할 직접 입력"
          aria-label={`경험 ${index + 1} 담당 역할`}
        />
      </Field>

      <Field label="사용 기술" hint="복수 선택">
        <EtcChipGroup
          options={TECH_STACKS}
          value={exp.stacks}
          onChange={(v) => onChange({ stacks: v })}
          etcValue={exp.stackEtc}
          onEtcChange={(v) => onChange({ stackEtc: v })}
          etcPlaceholder="사용 기술 직접 입력 (예: Spring Boot)"
          aria-label={`경험 ${index + 1} 사용 기술`}
        />
      </Field>

      <Field label="상세 설명">
        <Textarea
          placeholder="예: 교내 스터디 예약 웹 서비스 — Spring Boot로 예약·회원 API를 설계하고 MySQL 스키마를 구성했어요."
          value={exp.detail}
          onChange={(e) => onChange({ detail: e.target.value })}
        />
      </Field>
    </div>
  );
}