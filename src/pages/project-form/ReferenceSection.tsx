// src/pages/project-form/ReferenceSection.tsx
import { Plus } from 'lucide-react';
import { Input, Select } from '../../components/ui/Input';
import { LINK_TYPES } from '../../constants/projectForm';
import { newLinkId, type LinkRow, type SectionProps } from './formModel';
import s from './FormSections.module.css';

export function ReferenceSection({ form, update }: SectionProps) {
  const setLink = (id: string, patch: Partial<LinkRow>) =>
    update({ links: form.links.map((l) => (l.id === id ? { ...l, ...patch } : l)) });

  return (
    <section className={s.section}>
      <h2 className={s.title}>참고 정보</h2>
      <p className={s.desc}>기획안, GitHub, 공모전 안내 같은 관련 링크를 붙여 주세요.</p>

      <div className={s.linkList}>
        {form.links.map((link) => (
          <div key={link.id} className={s.linkRow}>
            <Select
              className={s.linkType}
              options={LINK_TYPES}
              value={link.type}
              aria-label="링크 종류"
              onChange={(e) => setLink(link.id, { type: e.target.value })}
            />
            <Input
              type="url"
              placeholder="https://"
              value={link.url}
              aria-label={`${link.type} 주소`}
              onChange={(e) => setLink(link.id, { url: e.target.value })}
            />
            <button
              type="button"
              className={s.textBtn}
              onClick={() => update({ links: form.links.filter((l) => l.id !== link.id) })}
            >
              삭제
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={s.dashedBtn}
        onClick={() => update({ links: [...form.links, { id: newLinkId(), type: LINK_TYPES[0], url: '' }] })}
      >
        <Plus size={15} aria-hidden="true" /> 링크 추가
      </button>
    </section>
  );
}
