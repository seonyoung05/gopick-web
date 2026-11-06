// src/pages/project-form/BasicInfoSection.tsx
import { ChipGroup } from '../../components/ui/Chip';
import { Input, Textarea } from '../../components/ui/Input';
import { PROJECT_FIELDS, PROJECT_PURPOSES } from '../../constants/projectForm';
import { FieldError, FieldLabel } from './FormParts';
import type { SectionProps } from './formModel';
import s from './FormSections.module.css';

export function BasicInfoSection({ form, update, showErrors }: SectionProps) {
  return (
    <section className={s.section}>
      <h2 className={s.title}>기본 정보</h2>
      <p className={s.desc}>어떤 프로젝트인지 알려 주세요.</p>

      <div className={s.field}>
        <FieldLabel required htmlFor="pf-name">프로젝트명</FieldLabel>
        <Input
          id="pf-name"
          placeholder="예: Vocarchive"
          value={form.name}
          invalid={showErrors && form.name.trim() === ''}
          onChange={(e) => update({ name: e.target.value })}
        />
        <FieldError show={showErrors && form.name.trim() === ''}>프로젝트명을 입력해 주세요.</FieldError>
      </div>

      <div className={s.field}>
        <FieldLabel htmlFor="pf-desc">프로젝트 설명</FieldLabel>
        <Textarea
          id="pf-desc"
          placeholder="해결하려는 문제와 구현할 서비스를 적어 주세요."
          value={form.description}
          onChange={(e) => update({ description: e.target.value })}
        />
      </div>

      <div className={s.field}>
        <FieldLabel required hint="복수 선택">프로젝트 분야</FieldLabel>
        <ChipGroup
          multiple
          options={PROJECT_FIELDS}
          value={form.fields}
          onChange={(fields) => update({ fields })}
          aria-label="프로젝트 분야"
        />
        <FieldError show={showErrors && form.fields.length === 0}>분야를 하나 이상 골라 주세요.</FieldError>
      </div>

      <div className={s.field}>
        <FieldLabel required hint="복수 선택">프로젝트 목적</FieldLabel>
        <ChipGroup
          multiple
          options={PROJECT_PURPOSES}
          value={form.purposes}
          onChange={(purposes) => update({ purposes })}
          aria-label="프로젝트 목적"
        />
        <FieldError show={showErrors && form.purposes.length === 0}>목적을 하나 이상 골라 주세요.</FieldError>
      </div>
    </section>
  );
}
