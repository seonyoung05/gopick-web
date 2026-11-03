import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { Button } from './components/ui/Button';
import { ChipGroup } from './components/ui/Chip';
import { Tag, Status, Pill, Badge, MineLabel } from './components/ui/Label';
import { Avatar } from './components/ui/Avatar';
import { Input, Textarea, Select } from './components/ui/Input';
import {
  CONTACT_TYPES,
  CONTACT_PLACEHOLDER,
  CONTACT_INPUT_TYPE,
  type ContactType,
} from './constants/contact';

const colors = [
  'blue', 'blue-deep', 'blue-soft', 'red', 'red-soft', 'yellow', 'yellow-soft',
  'yellow-ink', 'green', 'green-soft', 'violet', 'violet-soft',
  'canvas', 'surface', 'surface-2', 'line', 'line-strong', 'ink', 'sub', 'faint',
];

const texts = [
  ['t-display', 'Display 40'], ['t-h1', 'H1 26'], ['t-h2', 'H2 19'], ['t-h3', 'H3 18'],
  ['t-body-l', 'Body_L 17'], ['t-body-m', 'Body_M 15'], ['t-body-strong', 'Body_Strong 15'],
  ['t-body-label', 'Body_Label 15'], ['t-body-s', 'Body_S 14'],
  ['t-body-s-strong', 'Body_Small Strong 14'], ['t-caption', 'Caption 12'],
  ['t-caption-strong', 'Caption_Strong 12'],
];

export default function App() {
  const [stacks, setStacks] = useState<string[]>(['Python', 'Java']);
  const [tendency, setTendency] = useState<string | null>('상관없음');
  const [roles, setRoles] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [contactType, setContactType] = useState<ContactType>('디스코드');
  const [contactValue, setContactValue] = useState('');
  const [intro, setIntro] = useState('');
  return (
    <div style={{ padding: 40, display: 'grid', gap: 40 }}>
      <section>
        <h1 className="t-h1">Button</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <Button>프로젝트 모집 등록</Button>
          <Button variant="ghost">내 프로필 작성</Button>
          <Button variant="ai">모집글 초안 만들기</Button>
          <Button variant="saved" size="sm">★ 저장됨</Button>
          <Button variant="active" size="sm" icon={<Bookmark />}>스크랩</Button>
          <Button variant="ghost" size="sm" icon={<Bookmark />}>스크랩</Button>
          <Button size="sm">참여 제안 보내기</Button>
          <Button disabled>비활성</Button>
        </div>
        <div style={{ width: 320, marginTop: 16 }}>
          <Button block>지원하기 (block)</Button>
        </div>
      </section>
      <section>
        <h1 className="t-h1">Chip</h1>

        <p className="t-body-strong">기술 스택 (복수 선택)</p>
        <ChipGroup
          multiple
          options={['Python', 'Java', 'React', 'SQL', 'Figma', '기타']}
          value={stacks}
          onChange={setStacks}
          aria-label="기술 스택"
        />
        <p className="t-caption">선택: {stacks.join(', ') || '없음'}</p>

        <p className="t-body-strong">팀 내 성향 (단일 선택)</p>
        <ChipGroup
          options={['Lead', 'Follow', '상관없음']}
          value={tendency}
          onChange={setTendency}
          aria-label="팀 내 성향"
        />
        <p className="t-caption">선택: {tendency ?? '없음'}</p>

        <p className="t-body-strong">필터 (compact)</p>
        <ChipGroup
          multiple
          size="compact"
          options={['기획', 'Frontend', 'Backend', 'AI', 'Design']}
          value={roles}
          onChange={setRoles}
          aria-label="역할 필터"
        />
      </section>
      <section>
        <h1 className="t-h1">Tag · Status · Pill · Badge</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <Tag>Frontend 1명</Tag>
          <Tag tone="gray">Lead 성향</Tag>
          <Status status="recruit" />
          <Status status="ongoing" />
          <Status status="done" />
          <Pill type="pending" />
          <Pill type="accepted" />
          <Pill type="apply" />
          <Pill type="declined" />
          <Pill type="canceled" />
          <Pill type="offer" />
          <Badge count={3} />
          <Badge count={120} />
          <Badge count={0} />
          <MineLabel />
        </div>
      </section>
      <section>
        <h1 className="t-h1">Avatar</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Avatar name="김수뭉" size="sm" />
          <Avatar name="김수뭉" size="top" />
          <Avatar name="김수뭉" size="md" />
          <Avatar name="김수뭉" size="lg" />
          <Avatar name="김수뭉" size="xl" />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {['김도현', '문서아', '박원준', '송미래', '윤가람', '정다온'].map((n) => (
            <Avatar key={n} name={n} />
          ))}
          <Avatar name="한지우" color="muted" />
        </div>
      </section>

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
      <section>
        <h1 className="t-h1">Color</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {colors.map((c) => (
            <div key={c} style={{ width: 120 }}>
              <div style={{ height: 56, borderRadius: 'var(--r-md)', background: `var(--${c})`, border: '1px solid var(--line)' }} />
              <p className="t-caption" style={{ margin: '4px 0 0' }}>--{c}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h1 className="t-h1">Typography</h1>
        {texts.map(([cls, label]) => (
          <p key={cls} className={cls} style={{ margin: '8px 0' }}>
            {label} · 함께할 팀원을 찾아보세요
          </p>
        ))}
      </section>
    </div>
  );
}