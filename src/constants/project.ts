// src/constants/project.ts

/** 프로젝트 진행 단계 (순서 고정) */
export const STAGES = ['기획', '설계', '개발', '테스트', '배포'] as const;

export type Stage = (typeof STAGES)[number];
