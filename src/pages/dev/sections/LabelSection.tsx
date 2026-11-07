// src/pages/dev/sections/LabelSection.tsx
import { Tag, Status, Pill, Badge, MineLabel } from '../../../components/ui/Label';

export function LabelSection() {
  return (
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
  );
}