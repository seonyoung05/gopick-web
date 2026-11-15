// src/pages/projects/LogComposer.tsx
import { useState, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { monthDay } from './formatDate';
import styles from './LogComposer.module.css';

/** 활동 기록은 짧게 남기는 한 줄 메모예요 */
export const LOG_MAX_LENGTH = 100;

interface LogComposerProps {
  /** 기록에 표시될 이름 */
  author: string;
  onSubmit: (text: string) => void;
}

/** 활동 기록 입력: 오늘 날짜와 내 이름으로 한 줄 기록을 남겨요 */
export function LogComposer({ author, onSubmit }: LogComposerProps) {
  const [text, setText] = useState('');
  const trimmed = text.trim();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText('');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={LOG_MAX_LENGTH}
          placeholder="오늘 한 일이나 결정사항을 짧게 남겨요"
          aria-label="활동 기록 내용"
        />
        <Button type="submit" size="sm" disabled={!trimmed}>
          기록 남기기
        </Button>
      </div>
      <p className={styles.hint}>
        <span>
          {monthDay()}, {author}(으)로 남겨져요
        </span>
        <span>
          {text.length}/{LOG_MAX_LENGTH}
        </span>
      </p>
    </form>
  );
}
