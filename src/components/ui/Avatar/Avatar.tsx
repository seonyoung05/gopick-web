// src/components/ui/Avatar/Avatar.tsx
import clsx from 'clsx';
import styles from './Avatar.module.css';

export type AvatarSize = 'sm' | 'top' | 'md' | 'lg' | 'xl';
export type AvatarColor = 'blue' | 'red' | 'orange' | 'green' | 'violet' | 'muted';

const PALETTE: AvatarColor[] = ['blue', 'red', 'orange', 'green', 'violet'];

/** 같은 값이면 항상 같은 색이 나오도록 글자로 색을 고름 */
function colorFromText(text: string): AvatarColor {
  let sum = 0;
  for (const ch of text) sum += ch.charCodeAt(0);
  return PALETTE[sum % PALETTE.length];
}

interface AvatarProps {
  name: string;
  /** 색 계산 기준. 없으면 이름으로 계산 (API 연결 후에는 profileId를 넣기) */
  seed?: string | number;
  size?: AvatarSize;
  /** 직접 색을 정할 때 (예: 비공개 프로필은 'muted') */
  color?: AvatarColor;
  /** 프로필 사진이 생기면 사용 (없으면 첫 글자 표시) */
  src?: string;
  className?: string;
}

export function Avatar({ name, seed, size = 'md', color, src, className }: AvatarProps) {
  const bg = color ?? colorFromText(String(seed ?? name));
  return (
    <span className={clsx(styles.avatar, styles[size], !src && styles[bg], className)}>
      {src ? <img src={src} alt={name} /> : <span aria-label={name}>{name.charAt(0)}</span>}
    </span>
  );
}