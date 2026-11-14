// src/pages/project-form/CollabSection.tsx
import { ChipGroup } from '../../components/ui/Chip';
import { COLLAB_STYLES } from '../../constants/projectForm';
import { FieldLabel } from './FormParts';
import type { SectionProps } from './formModel';
import s from './FormSections.module.css';

export function CollabSection({ form, update }: SectionProps) {
  return (
    <section className={s.section}>
      <h2 className={s.title}>협업 조건</h2>
      <p className={s.desc}>팀이 선호하는 협업 방식이에요. 지원자의 협업 성향과 비교해요.</p>

      <div className={s.field}>
        <FieldLabel hint="복수 선택">협업 선호</FieldLabel>
        <ChipGroup
          multiple
          options={COLLAB_STYLES}
          value={form.collab}
          onChange={(collab) => update({ collab })}
          aria-label="협업 선호"
        />
      </div>
    </section>
  );
}
