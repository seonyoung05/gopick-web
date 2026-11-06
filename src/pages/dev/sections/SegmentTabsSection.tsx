// src/pages/dev/sections/SegmentTabsSection.tsx
import { useState } from 'react';
import { Segment } from '../../../components/ui/Segment';
import { Tabs } from '../../../components/ui/Tabs';

export function SegmentTabsSection() {
  const [visibility, setVisibility] = useState<'공개' | '비공개'>('공개');
  const [techCondition, setTechCondition] = useState<'상관없음' | '우대' | '필수'>('상관없음');
  const [searchMode, setSearchMode] = useState<'사람' | '프로젝트'>('사람');
  const [inboxTab, setInboxTab] = useState<'received' | 'sent'>('received');

  return (
    <>
      <section style={{ display: 'grid', gap: 16 }}>
        <h1 className="t-h1">Segment</h1>
        <div>
          <Segment
            options={['공개', '비공개']}
            value={visibility}
            onChange={setVisibility}
            aria-label="프로필 공개 설정"
          />
          <p className="t-caption">선택: {visibility}</p>
        </div>
        <Segment
          options={['상관없음', '우대', '필수']}
          value={techCondition}
          onChange={setTechCondition}
          aria-label="기술 조건"
        />
        <Segment
          size="lg"
          options={['사람', '프로젝트']}
          value={searchMode}
          onChange={setSearchMode}
          aria-label="검색 대상"
        />
      </section>

      <section>
        <h1 className="t-h1">Tabs</h1>
        <Tabs
          aria-label="제안·지원"
          value={inboxTab}
          onChange={setInboxTab}
          items={[
            { value: 'received', label: '받은 내역', count: 3 },
            { value: 'sent', label: '보낸 내역' },
          ]}
        />
        <p className="t-body-s" style={{ marginTop: 16 }}>
          지금 선택된 탭: {inboxTab}
        </p>
      </section>
    </>
  );
}