// src/pages/auth/AuthLayout.tsx
// 로그인 · 회원가입 공통 레이아웃: 왼쪽은 "마지막 한 조각" 퍼즐 그래픽, 오른쪽은 입력 카드
import type { CSSProperties, ReactNode } from 'react';
import { Check, Plus } from 'lucide-react';
import styles from './AuthPage.module.css';
import puzzle from './AuthPuzzle.module.css';

const BRAND = ['var(--blue)', 'var(--red)', 'var(--yellow)', 'var(--green)'];

/** 퍼즐 칸 (3×3). null = 빈 공간, 'slot' = 마지막 조각이 들어올 자리 */
type Piece = { color: string; shape: string; from: [number, number] };
const CELLS: (Piece | null | 'slot')[] = [
  { color: 'var(--blue)', shape: puzzle.cornerTL, from: [-60, -40] },
  null,
  { color: 'var(--red)', shape: puzzle.square, from: [70, -50] },
  null,
  { color: 'var(--yellow)', shape: puzzle.round, from: [0, -90] },
  { color: 'var(--green)', shape: puzzle.square, from: [80, 10] },
  { color: 'var(--green)', shape: puzzle.square, from: [-80, 40] },
  'slot',
  { color: 'var(--blue)', shape: puzzle.cornerBR, from: [60, 70] },
];

/** 조각이 하나씩 날아와 맞춰지고 → 빈칸이 깜빡이다가 → 마지막 조각(새 팀원)이 들어와 완성 → 반복 (6초) */
function Puzzle() {
  let order = 0;
  return (
    <div className={puzzle.grid} aria-hidden="true">
      {CELLS.map((cell, i) => {
        if (cell === null) return <span key={i} className={puzzle.cell} />;
        if (cell === 'slot') {
          return (
            <span key={i} className={`${puzzle.cell} ${puzzle.slot}`}>
              <span className={puzzle.slotHint}>
                <Plus size={34} />
              </span>
              <span className={puzzle.last}>
                <Check size={36} strokeWidth={3} />
              </span>
            </span>
          );
        }
        const style = {
          background: cell.color,
          animationDelay: `${order++ * 0.18}s`,
          '--from-x': `${cell.from[0]}px`,
          '--from-y': `${cell.from[1]}px`,
        } as CSSProperties;
        return <span key={i} className={`${puzzle.cell} ${puzzle.piece} ${cell.shape}`} style={style} />;
      })}
    </div>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.screen}>
      <aside className={styles.intro} aria-label="GoPick 소개">
        <div className={styles.stripe} aria-hidden="true">
          {BRAND.map((c) => (
            <span key={c} style={{ background: c }} />
          ))}
        </div>

        <div className={styles.logo}>
          <span className={styles.dots} aria-hidden="true">
            {BRAND.map((c) => (
              <span key={c} style={{ background: c }} />
            ))}
          </span>
          <span className={styles.wordmark}>GoPick</span>
        </div>

        <div className={puzzle.body}>
          <Puzzle />
          <div className={puzzle.copy}>
            <h1>
              우리 팀의
              <br />
              마지막 한 조각
            </h1>
            <p>GoPick에서 함께할 사람을 고르세요.</p>
          </div>
        </div>

        <p className={puzzle.foot}>GDGoC 구성원을 위한 팀원 추천 · 매칭 서비스</p>
      </aside>

      <main className={styles.formSide}>{children}</main>
    </div>
  );
}
