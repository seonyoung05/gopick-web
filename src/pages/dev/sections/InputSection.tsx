// src/pages/dev/sections/InputSection.tsx
import { useState } from 'react';
import { Input, Textarea, Select } from '../../../components/ui/Input';
import {
  CONTACT_TYPES,
  CONTACT_PLACEHOLDER,
  CONTACT_INPUT_TYPE,
  type ContactType,
} from '../../../constants/contact';

export function InputSection() {
  const [name, setName] = useState('');
  const [contactType, setContactType] = useState<ContactType>('디스코드');
  const [contactValue, setContactValue] = useState('');
  const [intro, setIntro] = useState('');

  return (
    <section style={{ maxWidth: 480, display: 'grid', gap: 12 }}>
      <h1 className="t-h1">Input · Textarea · Select</h1>
      <Input placeholder="예: 김수뭉" value={name} onChange={(e) => setName(e.target.value)} />
      <Input value="필수 항목이에요" invalid readOnly />
      <div style={{ display: 'flex', gap: 8 }}>
        <Select
          options={CONTACT_TYPES}
          value={contactType}
          onChange={(e) => {
            setContactType(e.target.value as ContactType);
            setContactValue('');
          }}
          style={{ width: 170 }}
        />
        <Input
          type={CONTACT_INPUT_TYPE[contactType]}
          placeholder={CONTACT_PLACEHOLDER[contactType]}
          value={contactValue}
          onChange={(e) => setContactValue(e.target.value)}
        />
      </div>
      <Textarea
        placeholder="예: Spring Boot로 REST API를 설계해 본 경험이 있어요."
        value={intro}
        onChange={(e) => setIntro(e.target.value)}
      />
      <Input placeholder="비활성 상태" disabled />
    </section>
  );
}