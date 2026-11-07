// src/mocks/myProjects.ts

export interface MyRecruitment {
  recruitmentId: string;
  role: string;
  remaining: number; // 남은 모집 인원
}

export interface MyRecruitingProject {
  id: string;
  name: string;
  recruitments: MyRecruitment[];
}

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