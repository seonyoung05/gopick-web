// src/mocks/myProjects.ts
// 추천 화면(목 데이터)에서만 사용. 추천 API가 생기면 삭제
import type { MyRecruitingProject } from '../types/participation';

/** 내가 모집 중인 프로젝트 (API 연결 전 임시) */
export const MY_RECRUITING_PROJECTS: MyRecruitingProject[] = [
  {
    id: 'proj-vocarchive',
    name: 'Vocarchive',
    recruitments: [
      { recruitmentId: 'r1', role: 'Backend', remaining: 2 },
      { recruitmentId: 'r2', role: 'Frontend', remaining: 1 },
    ],
  },
];