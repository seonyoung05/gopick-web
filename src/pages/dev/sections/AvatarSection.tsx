// src/pages/dev/sections/AvatarSection.tsx
import { Avatar } from '../../../components/ui/Avatar';

const SAMPLE_NAMES = ['김도현', '문서아', '박원준', '송미래', '윤가람', '정다온'];

export function AvatarSection() {
  return (
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
        {SAMPLE_NAMES.map((n) => (
          <Avatar key={n} name={n} />
        ))}
        <Avatar name="한지우" color="muted" />
      </div>
    </section>
  );
}