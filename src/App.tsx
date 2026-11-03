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
import { Segment } from './components/ui/Segment';
import { Tabs } from './components/ui/Tabs';
import { Checkbox } from './components/ui/Checkbox';
import { Stepper } from './components/ui/Stepper';
import { LevelSelect } from './components/ui/LevelSelect';
import { TECH_LEVELS, REQUIRED_LEVELS, type TechLevel, type RequiredLevel } from './constants/levels';
import { FilterPanel, createFilterValues } from './components/common/FilterPanel';
import { PEOPLE_FILTERS, PROJECT_FILTERS } from './constants/filters';

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
  const [visibility, setVisibility] = useState<'공개' | '비공개'>('공개');
  const [techCondition, setTechCondition] = useState<'상관없음' | '우대' | '필수'>('상관없음');
  const [searchMode, setSearchMode] = useState<'사람' | '프로젝트'>('사람');
  const [inboxTab, setInboxTab] = useState<'received' | 'sent'>('received');
  const [tasks, setTasks] = useState([
    { title: 'DB 및 개발 환경 구축', done: true },
    { title: '프로필 입력 화면 구현', done: false },
    { title: '추천 로직 구현', done: false },
  ]);
  const [backendCount, setBackendCount] = useState(2);
  const [javaLevel, setJavaLevel] = useState<TechLevel | null>('실전 경험');
  const [pythonLevel, setPythonLevel] = useState<TechLevel | null>(null);
  const [reactRequired, setReactRequired] = useState<RequiredLevel | null>('기초 경험 이상');
  const [peopleFilters, setPeopleFilters] = useState(() => createFilterValues(PEOPLE_FILTERS));
  const [projectFilters, setProjectFilters] = useState(() => createFilterValues(PROJECT_FILTERS));
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
            { value: 'received', label: '받은 내역' },
            { value: 'sent', label: '보낸 내역' },
          ]}
        />
        <p className="t-body-s" style={{ marginTop: 16 }}>
          지금 선택된 탭: {inboxTab}
        </p>
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
      <section style={{ display: 'grid', gap: 12 }}>
        <h1 className="t-h1">Checkbox</h1>
        {tasks.map((task, i) => (
          <Checkbox
            key={task.title}
            checked={task.done}
            onChange={(checked) =>
              setTasks(tasks.map((t, j) => (j === i ? { ...t, done: checked } : t)))
            }
            label={task.title}
          />
        ))}
        <p className="t-caption">
          완료 {tasks.filter((t) => t.done).length} / {tasks.length}
        </p>
      </section>

      <section style={{ display: 'grid', gap: 12 }}>
        <h1 className="t-h1">Stepper</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="t-body-strong">Backend</span>
          <Stepper
            value={backendCount}
            onChange={setBackendCount}
            min={1}
            max={5}
            aria-label="Backend 모집 인원"
          />
        </div>
      </section>

      <section style={{ display: 'grid', gap: 12, maxWidth: 760 }}>
        <h1 className="t-h1">Level select</h1>
        <p className="t-body-strong">Java (프로필 · 4단계)</p>
        <LevelSelect options={TECH_LEVELS} value={javaLevel} onChange={setJavaLevel} aria-label="Java 활용 수준" />
        <p className="t-body-strong">Python (아직 선택 안 함)</p>
        <LevelSelect options={TECH_LEVELS} value={pythonLevel} onChange={setPythonLevel} aria-label="Python 활용 수준" />
        <p className="t-body-strong">React 요구 수준 (등록 폼 · 2단계)</p>
        <LevelSelect
          options={REQUIRED_LEVELS}
          value={reactRequired}
          onChange={setReactRequired}
          aria-label="React 요구 수준"
        />
      </section>
      <section>
        <h1 className="t-h1">FilterPanel</h1>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <FilterPanel groups={PEOPLE_FILTERS} values={peopleFilters} onChange={setPeopleFilters} />
          <FilterPanel
            groups={PROJECT_FILTERS}
            values={projectFilters}
            onChange={setProjectFilters}
            extraAction={<Button variant="ghost" size="sm" block>내 프로필로 채우기</Button>}
          />
          <pre className="t-caption" style={{ background: 'var(--surface)', padding: 16, borderRadius: 12 }}>
            {JSON.stringify(peopleFilters, null, 2)}
          </pre>
        </div>
      </section>
    </div>
  );
}