// src/components/common/FilterPanel/FilterPanel.tsx
import clsx from 'clsx';
import type { ReactNode } from 'react';
import { ChipGroup } from '../../ui/Chip';
import styles from './FilterPanel.module.css';

/** 필터 그룹 하나의 설정 */
export interface FilterGroupConfig {
  key: string;
  label: string;
  options: readonly string[];
  /** 기본은 복수 선택. false면 하나만 선택 (예: 기술 최소 수준) */
  multiple?: boolean;
  /** 초기화했을 때의 값 (예: ['수준 무관'], ['모집 중']) */
  defaultValue?: string[];
  /** 칩 아래 작은 안내 문구 */
  legend?: string;
}

/** 모든 필터 값: { role: ['Backend'], level: ['수준 무관'], ... } */
export type FilterValues = Record<string, string[]>;

/** 설정 목록으로 초기값 만들기 */
export function createFilterValues(groups: readonly FilterGroupConfig[]): FilterValues {
  return Object.fromEntries(groups.map((g) => [g.key, g.defaultValue ?? []]));
}

interface FilterPanelProps {
  groups: readonly FilterGroupConfig[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  /** 초기화 버튼 위에 넣을 추가 버튼 (예: "내 프로필로 채우기") */
  extraAction?: ReactNode;
  className?: string;
}

export function FilterPanel({ groups, values, onChange, extraAction, className }: FilterPanelProps) {
  const setGroup = (key: string, next: string[]) => onChange({ ...values, [key]: next });

  return (
    <aside className={clsx(styles.panel, className)} aria-label="검색 필터">
      {groups.map((group) => {
        const current = values[group.key] ?? [];
        return (
          <div key={group.key} className={styles.group}>
            <p className={styles.groupTitle}>{group.label}</p>

            {group.multiple === false ? (
              <ChipGroup
                size="compact"
                options={group.options}
                value={current[0] ?? null}
                onChange={(v) => setGroup(group.key, [v])}
                aria-label={group.label}
              />
            ) : (
              <ChipGroup
                multiple
                size="compact"
                options={group.options}
                value={current}
                onChange={(v) => setGroup(group.key, v)}
                aria-label={group.label}
              />
            )}

            {group.legend && <p className={styles.legend}>{group.legend}</p>}
          </div>
        );
      })}

      <div className={styles.footer}>
        {extraAction}
        <button type="button" className={styles.reset} onClick={() => onChange(createFilterValues(groups))}>
          필터 초기화
        </button>
      </div>
    </aside>
  );
}