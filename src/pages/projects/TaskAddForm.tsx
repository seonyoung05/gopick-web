// src/pages/projects/TaskAddForm.tsx
import { useState, type FormEvent } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './TaskAddForm.module.css';

/** 과제는 짧은 한 줄 메모예요 */
export const TASK_MAX_LENGTH = 60;

interface TaskAddFormProps {
  /** 단계 이름 (안내 문구에 써요) */
  stageName: string;
  onAdd: (text: string) => void;
}

/** 단계에 세부 과제를 글로 적어 등록하는 한 줄 입력 */
export function TaskAddForm({ stageName, onAdd }: TaskAddFormProps) {
  const [text, setText] = useState('');
  const trimmed = text.trim();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={TASK_MAX_LENGTH}
        placeholder={`${stageName} 단계 과제를 적어 등록해요`}
        aria-label={`${stageName} 단계 과제 입력`}
      />
      <Button type="submit" size="sm" disabled={!trimmed}>
        추가
      </Button>
    </form>
  );
}
