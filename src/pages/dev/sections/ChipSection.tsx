import { useState } from 'react';
import { ChipGroup } from '../../../components/ui/Chip';

export function ChipSection() {
  const [stacks, setStacks] = useState<string[]>(['Python', 'Java']);
  const [tendency, setTendency] = useState<string | null>('상관없음');
  const [roles, setRoles] = useState<string[]>([]);

  return(
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
  );
}