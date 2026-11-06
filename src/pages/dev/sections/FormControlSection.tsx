// src/pages/dev/sections/FormControlSection.tsx
import { useState } from 'react';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Stepper } from '../../../components/ui/Stepper';
import { LevelSelect } from '../../../components/ui/LevelSelect';
import {
  TECH_LEVELS,
  REQUIRED_LEVELS,
  type TechLevel,
  type RequiredLevel,
} from '../../../constants/levels';

const INITIAL_TASKS = [
  { title: 'DB 및 개발 환경 구축', done: true },
  { title: '프로필 입력 화면 구현', done: false },
  { title: '추천 로직 구현', done: false },
];

export function FormControlSection() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [backendCount, setBackendCount] = useState(2);
  const [javaLevel, setJavaLevel] = useState<TechLevel | null>('실전 경험');
  const [pythonLevel, setPythonLevel] = useState<TechLevel | null>(null);
  const [reactRequired, setReactRequired] = useState<RequiredLevel | null>('기초 경험 이상');

  return (
    <>
      <section style={{ display: 'grid', gap: 12 }}>
        <h1 className="t-h1">Checkbox</h1>
        {tasks.map((task, i) => (
          <Checkbox
            key={task.title}
            checked={task.done}
            onChange={(checked) =>
              setTasks(tasks.map((t, j) => (j === i ? { ...t, done: checked } : t)))
            }
            label={task.title}
          />
        ))}
        <p className="t-caption">
          완료 {tasks.filter((t) => t.done).length} / {tasks.length}
        </p>
      </section>

      <section style={{ display: 'grid', gap: 12 }}>
        <h1 className="t-h1">Stepper</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="t-body-strong">Backend</span>
          <Stepper
            value={backendCount}
            onChange={setBackendCount}
            min={1}
            max={5}
            aria-label="Backend 모집 인원"
          />
        </div>
      </section>

      <section style={{ display: 'grid', gap: 12, maxWidth: 760 }}>
        <h1 className="t-h1">Level select</h1>
        <p className="t-body-strong">Java (프로필 · 4단계)</p>
        <LevelSelect
          options={TECH_LEVELS}
          value={javaLevel}
          onChange={setJavaLevel}
          aria-label="Java 활용 수준"
        />
        <p className="t-body-strong">Python (아직 선택 안 함)</p>
        <LevelSelect
          options={TECH_LEVELS}
          value={pythonLevel}
          onChange={setPythonLevel}
          aria-label="Python 활용 수준"
        />
        <p className="t-body-strong">React 요구 수준 (등록 폼 · 2단계)</p>
        <LevelSelect
          options={REQUIRED_LEVELS}
          value={reactRequired}
          onChange={setReactRequired}
          aria-label="React 요구 수준"
        />
      </section>
    </>
  );
}