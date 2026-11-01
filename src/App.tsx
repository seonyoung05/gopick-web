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
  return (
    <div style={{ padding: 40, display: 'grid', gap: 40 }}>
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