// src/pages/auth/AuthLayout.tsx
import type { ReactNode } from 'react';
import styles from './AuthPage.module.css';

const BRAND = ['var(--blue)', 'var(--red)', 'var(--yellow)', 'var(--green)'];

const FEATURES = [
  { color: 'var(--blue)', title: '프로필 입력', desc: '기술 스택과 수준, 관심 분야, 협업 성향을 등록해요.' },
  { color: 'var(--red)', title: '팀원 추천·검색', desc: '프로젝트에 맞는 사람을 적합한 순서로 추천받거나 직접 찾아요.' },
  { color: 'var(--green)', title: '지원·제안과 진행 공유', desc: '수락되면 연락처가 공개되고, 팀의 진행 상황을 함께 봐요.' },
];

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.screen}>
      <aside className={styles.intro} aria-label="GoPick 소개">
        <div className={styles.stripe} aria-hidden="true">
          {BRAND.map((c) => <span key={c} style={{ background: c }} />)}
        </div>

        <div className={styles.logo}>
          <span className={styles.dots} aria-hidden="true">
            {BRAND.map((c) => <span key={c} style={{ background: c }} />)}
          </span>
          <span className={styles.wordmark}>GoPick</span>
        </div>

        <div>
          <div className={styles.hero}>
            <h1>
              기술, 관심사, 경험으로
              <br />
              함께할 팀원을 찾아보세요
            </h1>
            <p>
              GoPick은 GDGoC 구성원의 프로필을 바탕으로 프로젝트에 맞는 팀원을 탐색·추천하고, 팀이 꾸려진 뒤에는
              진행 상황까지 한곳에서 보여줘요.
            </p>
          </div>
          <ol className={styles.features}>
            {FEATURES.map((f, i) => (
              <li key={f.title}>
                <span className={styles.num} style={{ background: f.color }}>{i + 1}</span>
                <div>
                  <strong>{f.title}</strong>
                  <p>{f.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.spacer} aria-hidden="true" />
      </aside>

      <main className={styles.formSide}>{children}</main>
    </div>
  );
}