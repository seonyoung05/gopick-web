// src/components/ui/Avatar/Avatar.tsx
import clsx from 'clsx';
import styles from './Avatar.module.css';

export type AvatarSize = 'sm' | 'top' | 'md' | 'lg' | 'xl';
export type AvatarColor = 'blue' | 'red' | 'orange' | 'green' | 'violet' | 'muted';

const PALETTE: AvatarColor[] = ['blue', 'red', 'orange', 'green', 'violet'];

/** 같은 이름이면 항상 같은 색이 나오도록 이름으로 색을 고름 */
function colorFromName(name: string): AvatarColor {
  let sum = 0;
  for (const ch of name) sum += ch.charCodeAt(0);
  return PALETTE[sum % PALETTE.length];
}

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  /** 지정하지 않으면 이름으로 자동 결정 */
  color?: AvatarColor;
  /** 프로필 사진이 생기면 사용 (없으면 첫 글자 표시) */
  src?: string;
  className?: string;
}

export function Avatar({ name, size = 'md', color, src, className }: AvatarProps) {
  const bg = color ?? colorFromName(name);
  return (
    <span className={clsx(styles.avatar, styles[size], !src && styles[bg], className)}>
      {src ? <img src={src} alt={name} /> : <span aria-label={name}>{name.charAt(0)}</span>}
    </span>
  );
}