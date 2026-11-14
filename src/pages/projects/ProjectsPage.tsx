// src/pages/projects/ProjectsPage.tsx
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, type TabItem } from '../../components/ui/Tabs';
import { recruitProjects, ongoingProjects, doneProjects } from '../../mocks/projects';
import type { RecruitProject, TeamProject } from '../../types/project';
import { RecruitCard } from './RecruitCard';
import { ProjectListItem } from './ProjectListItem';
import { ProjectDetail } from './ProjectDetail';
import styles from './ProjectsPage.module.css';

type TabKey = 'recruit' | 'ongoing' | 'done';
type TeamTabKey = Exclude<TabKey, 'recruit'>;

const TAB_KEYS: readonly TabKey[] = ['recruit', 'ongoing', 'done'];

function toggleScrap<T extends { id: string; scrapped: boolean }>(list: T[], id: string): T[] {
  return list.map((p) => (p.id === id ? { ...p, scrapped: !p.scrapped } : p));
}

export default function ProjectsPage() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('tab');
  const tab: TabKey = TAB_KEYS.find((k) => k === raw) ?? 'recruit';

  const [recruit, setRecruit] = useState<RecruitProject[]>(recruitProjects);
  const [teams, setTeams] = useState<Record<TeamTabKey, TeamProject[]>>({
    ongoing: ongoingProjects,
    done: doneProjects,
  });
  const [selected, setSelected] = useState<Record<TeamTabKey, string>>({
    ongoing: ongoingProjects[0].id,
    done: doneProjects[0].id,
  });

  const tabItems: TabItem<TabKey>[] = [
    { value: 'recruit', label: `모집 중 ${recruit.length}` },
    { value: 'ongoing', label: `진행 중 ${teams.ongoing.length}` },
    { value: 'done', label: `완료 · 아카이브 ${teams.done.length}` },
  ];

  const updateTeam = (key: TeamTabKey, id: string, fn: (p: TeamProject) => TeamProject) =>
    setTeams((prev) => ({ ...prev, [key]: prev[key].map((p) => (p.id === id ? fn(p) : p)) }));

  const setTaskDone = (key: TeamTabKey, id: string, stage: number, taskIndex: number, done: boolean) =>
    updateTeam(key, id, (p) => ({
      ...p,
      tasks: p.tasks.map((list, si) =>
        si === stage ? list.map((t, ti) => (ti === taskIndex ? { ...t, done } : t)) : list,
      ),
    }));

  const renderTeamTab = (key: TeamTabKey) => {
    const list = teams[key];
    const current = list.find((p) => p.id === selected[key]) ?? list[0];

    return (
      <div className={styles.split}>
        <div className={styles.list}>
          {list.map((p) => (
            <ProjectListItem
              key={p.id}
              project={p}
              selected={p.id === current.id}
              onSelect={() => setSelected((s) => ({ ...s, [key]: p.id }))}
              onToggleScrap={() => setTeams((prev) => ({ ...prev, [key]: toggleScrap(prev[key], p.id) }))}
            />
          ))}
        </div>
        <ProjectDetail
          key={current.id}
          project={current}
          // TODO: 로그인한 사용자가 이 프로젝트의 팀 구성원인지로 교체 (지금은 진행 중 탭만 수정 가능)
          editable={key === 'ongoing'}
          onToggleScrap={() => setTeams((prev) => ({ ...prev, [key]: toggleScrap(prev[key], current.id) }))}
          onToggleTask={(stage, ti, done) => setTaskDone(key, current.id, stage, ti, done)}
        />
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <h1 className={`t-h1 ${styles.heading}`}>프로젝트</h1>
      <p className={styles.sub}>
        모집 중 · 진행 중 · 완료로 나눠 보여줘요. 각 탭 안에서는 최근 활동순이고, 모든 팀의 진행 정보는 공개돼요.
      </p>

      <Tabs
        className={styles.tabs}
        aria-label="프로젝트 상태"
        items={tabItems}
        value={tab}
        onChange={(value) => setParams({ tab: value })}
      />

      {tab === 'recruit' ? (
        <div className={styles.recruitList}>
          {recruit.map((p) => (
            <RecruitCard
              key={p.id}
              project={p}
              onToggleScrap={() => setRecruit((prev) => toggleScrap(prev, p.id))}
              // TODO: 공통 Modal이 main에 병합되면 지원 모달(M2)을 연결
              onApply={() => undefined}
            />
          ))}
        </div>
      ) : (
        renderTeamTab(tab)
      )}
    </div>
  );
}
