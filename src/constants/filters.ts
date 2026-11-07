// src/constants/filters.ts
import type { FilterGroupConfig } from '../components/common/FilterPanel';
import {
  ROLES, TECH_STACKS, FIELDS, PURPOSES, TEAM_SIZES, PROJECT_STATUSES,
  PROJECT_TENDENCIES, COLLAB_PREFERENCES, withoutEtc,
} from './options';

/** 검색 - 사람 (A 담당) */
export const PEOPLE_FILTERS: FilterGroupConfig[] = [
  { key: 'roles', label: '역할', options: withoutEtc(ROLES) },
  { key: 'stacks', label: '기술 스택', options: withoutEtc(TECH_STACKS) },
  {
    key: 'minLevel',
    label: '기술 최소 수준',
    options: ['수준 무관', '기초 경험 이상', '실전 경험 이상'],
    multiple: false,
    defaultValue: ['수준 무관'],
    legend: '기초: 간단한 프로젝트·코딩 경험 / 실전: 프로젝트에서 직접 활용 / 심화: 복잡한 문제를 독립적으로 해결',
  },
  { key: 'fields', label: '관심 분야', options: withoutEtc(FIELDS) },
  { key: 'tendencies', label: '프로젝트 성향', options: PROJECT_TENDENCIES },
  { key: 'collab', label: '협업 성향', options: COLLAB_PREFERENCES.slice(0, 5) },
];

/** 검색 - 프로젝트 (B 담당) */
export const PROJECT_FILTERS: FilterGroupConfig[] = [
  { key: 'status', label: '상태', options: PROJECT_STATUSES, defaultValue: ['모집 중'] },
  { key: 'roles', label: '모집 역할', options: withoutEtc(ROLES) },
  { key: 'stacks', label: '기술 조건', options: [...withoutEtc(TECH_STACKS), '스택 무관'] },
  { key: 'fields', label: '프로젝트 분야', options: withoutEtc(FIELDS) },
  { key: 'purposes', label: '프로젝트 목적', options: PURPOSES },
  { key: 'teamSize', label: '목표 팀 규모', options: TEAM_SIZES },
];