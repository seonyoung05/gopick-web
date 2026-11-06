// src/pages/projects/ProjectListItem.tsx
import clsx from 'clsx';
import type { TeamProject } from '../../types/project';
import { ScrapButton } from './ScrapButton';
import { StageDots } from './StageTracker';
import styles from './ProjectListItem.module.css';

interface ProjectListItemProps {
  project: TeamProject;
  selected: boolean;
  onSelect: () => void;
  onToggleScrap: () => void;
}

export function ProjectListItem({ project: p, selected, onSelect, onToggleScrap }: ProjectListItemProps) {
  return (
    <div className={clsx(styles.item, selected && styles.selected)}>
      <button type="button" className={styles.main} aria-pressed={selected} onClick={onSelect}>
        <strong className="t-body-strong">{p.title}</strong>
        <span className={styles.group}>{p.group}</span>
        <StageDots currentStage={p.currentStage} />
        <span className={styles.last}>최근 활동 {p.lastActive}</span>
      </button>
      <div className={styles.scrap}>
        <ScrapButton iconOnly scrapped={p.scrapped} onToggle={onToggleScrap} />
      </div>
    </div>
  );
}
