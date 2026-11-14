// src/pages/project-form/TeamSummary.tsx
// 오른쪽 sticky 패널: 팀 구성 요약 + 추천에 필요한 항목
import clsx from 'clsx';
import { requiredItems, roleParts, summarize, type ProjectFormValues } from './formModel';
import s from './TeamSummary.module.css';

export function TeamSummary({ form }: { form: ProjectFormValues }) {
  const { current, recruit, total, range, fits } = summarize(form);
  const items = requiredItems(form);

  return (
    <aside className={s.panel} aria-label="팀 구성 요약">
      <h3 className={s.title}>팀 구성</h3>

      <dl className={s.rows}>
        <div>
          <dt>현재 인원</dt>
          <dd>{current}명</dd>
        </div>
        <div>
          <dt>모집 인원</dt>
          <dd>{recruit}명</dd>
        </div>
        {form.roles.map((r) => {
          const { head, tech } = roleParts(r, form.roleDetails[r]);
          return (
            <div key={r} className={s.sub}>
              <dt>{head}</dt>
              <dd>{tech}</dd>
            </div>
          );
        })}
        <div className={s.total}>
          <dt>모집 완료 시 팀 규모</dt>
          <dd>{total}명</dd>
        </div>
      </dl>

      {range && (
        <p className={clsx(s.fit, fits ? s.fitOk : s.fitWarn)} role="status">
          {fits
            ? `목표 팀 규모 ${range.label}에 맞아요.`
            : `목표 팀 규모 ${range.label}와 달라요. 지금은 ${total}명이에요.`}
        </p>
      )}

      <h3 className={clsx(s.title, s.second)}>추천에 필요한 항목</h3>
      <ul className={s.checks}>
        {items.map((it) => (
          <li key={it.key}>
            <span>{it.label}</span>
            <strong className={it.done ? s.done : s.todo}>{it.done ? '완료' : '입력 필요'}</strong>
          </li>
        ))}
      </ul>
    </aside>
  );
}
