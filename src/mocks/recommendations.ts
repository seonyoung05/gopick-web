// src/mocks/recommendations.ts
import { MOCK_PEOPLE } from './people';
import type { Recommendation } from '../types/recommendation';

const person = (id: string) => MOCK_PEOPLE.find((p) => p.id === id)!;

/** recruitmentId별 추천 결과 (API 연결 전 임시) */
export const MOCK_RECOMMENDATIONS: Record<string, Recommendation[]> = {
  // Backend 2명 모집
  r1: [
    {
      person: person('p8'), // 장태민
      rank: 1,
      relation: 'applied',
      matched: [
        { category: 'role', text: 'Backend 희망' },
        { category: 'stack', text: 'Java 심화 경험' },
        { category: 'field', text: '웹' },
        { category: 'purpose', text: '해커톤' },
      ],
      unmatched: [
        { category: 'field', text: 'AI 관심 없음' },
        { category: 'collab', text: '문서화 선호 아님' },
        { category: 'purpose', text: '포트폴리오' },
      ],
    },
    {
      person: person('p9'), // 정다온
      rank: 1,
      relation: 'offered',
      matched: [
        { category: 'role', text: 'Backend 희망' },
        { category: 'stack', text: 'Java 실전 경험' },
        { category: 'collab', text: '문서화 선호' },
        { category: 'field', text: '웹' },
      ],
      unmatched: [
        { category: 'field', text: 'AI 관심 없음' },
        { category: 'collab', text: '빠른 피드백 아님' },
      ],
    },
    {
      person: person('p10'), // 이준호
      rank: 3,
      relation: 'none',
      matched: [
        { category: 'stack', text: 'Python 심화 경험' },
        { category: 'role', text: 'Backend 희망' },
        { category: 'field', text: 'AI' },
      ],
      unmatched: [
        { category: 'collab', text: '코드 리뷰·빠른 피드백 선호 아님' },
        { category: 'field', text: '웹 관심 없음' },
        { category: 'purpose', text: '포트폴리오' },
      ],
    },
    {
      person: person('p1'), // 김도현
      rank: 4,
      relation: 'none',
      matched: [
        { category: 'role', text: 'Backend 희망' },
        { category: 'collab', text: '빠른 피드백' },
        { category: 'field', text: '웹' },
      ],
      unmatched: [
        { category: 'stack', text: '주력 스택 기초 경험' },
        { category: 'experience', text: '프로젝트 경험 없음' },
      ],
    },
    {
      person: person('p4'), // 배하준
      rank: 5,
      relation: 'rejected',
      matched: [{ category: 'role', text: 'Backend 희망' }],
      unmatched: [
        { category: 'stack', text: '주력 스택 기초 경험' },
        { category: 'field', text: '웹·AI 관심 없음' },
      ],
    },
  ],

  // Frontend 1명 모집
  r2: [
    {
      person: person('p11'), // 최유나
      rank: 1,
      relation: 'none',
      matched: [
        { category: 'stack', text: 'React 심화 경험' },
        { category: 'collab', text: '코드 리뷰 선호' },
        { category: 'role', text: 'Frontend 희망' },
      ],
      unmatched: [{ category: 'field', text: 'AI 관심 없음' }],
    },
    {
      person: person('p6'), // 오세린
      rank: 2,
      relation: 'applied',
      matched: [
        { category: 'stack', text: 'React 실전 경험' },
        { category: 'role', text: 'Frontend 희망' },
      ],
      unmatched: [{ category: 'purpose', text: '해커톤 관심 없음' }],
    },
    {
      person: person('p3'), // 박원준
      rank: 3,
      relation: 'none',
      matched: [
        { category: 'field', text: 'AI' },
        { category: 'role', text: 'Frontend 희망' },
      ],
      unmatched: [{ category: 'stack', text: 'React 기초 경험 (우대: 기초 이상 충족)' }],
    },
  ],
};