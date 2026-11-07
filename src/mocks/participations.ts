// src/mocks/participations.ts
import { MOCK_PEOPLE } from './people';
import type { Participation, ParticipationProject } from '../types/participation';

const person = (id: string) => MOCK_PEOPLE.find((p) => p.id === id)!;

const PROJECTS: Record<string, ParticipationProject> = {
  bot: {
    id: 'proj-bot',
    name: 'GDGoC 커뮤니티 봇',
    description: '디스코드·슬랙과 연동해 동아리 일정과 스터디 출석을 관리하는 봇이에요.',
    ownerName: '문서아',
    summary: '현재 팀 기획 1명, Backend 1명 | AI, 웹, 실사용 서비스, 학습',
  },
  lens: {
    id: 'proj-lens',
    name: '공시 렌즈',
    description: '기업 공시 데이터를 모아 시각화하고 핵심을 요약해 주는 대시보드예요.',
    ownerName: '이준호',
    summary: '현재 팀 AI 1명, Backend 1명 | 데이터, 웹, 공모전',
  },
  voc: {
    id: 'proj-vocarchive',
    name: 'Vocarchive',
    description: 'LLM으로 사용자의 오답 패턴을 분석해 맞춤형 영단어장을 만들어 주는 학습 서비스예요.',
    ownerName: '김수뭉',
    summary: '현재 팀 기획 1명, AI 1명 | AI, 웹, 해커톤, 포트폴리오',
  },
  matjip: {
    id: 'proj-matjip',
    name: '캠퍼스 맛집 지도',
    description: '학교 주변 식당을 학생 리뷰와 지도로 모아 보는 모바일 웹 서비스예요.',
    ownerName: '배하준',
    summary: '현재 팀 Backend 1명, 기획 1명 | 앱, UX·UI, 포트폴리오, 공모전',
  },
  mcmory: {
    id: 'proj-mcmory',
    name: 'MCMORY',
    description: '상대방 취향을 미리 확인하고 함께한 추억을 기록하는 선물 큐레이션 플랫폼이에요.',
    ownerName: '송미래',
    summary: '현재 팀 4명 | 앱, 실사용 서비스',
  },
};

/** 수락 시 공개될 연락처 (API 연결 전 임시) */
export const mockContactOf = (personId: string) => ({ type: '디스코드' as const, value: `${personId}.gopick` });

/** 내(김수뭉) 입장에서 본 제안·지원 목록 (API 연결 전 임시) */
export const MOCK_PARTICIPATIONS: Participation[] = [
  /* ---------- 받은 내역 ---------- */
  {
    id: 'pr1', kind: 'offer', direction: 'received', status: 'pending', read: false,
    project: PROJECTS.bot, role: 'Backend', roleCondition: '1명 모집, 스택 무관',
    counterpart: person('p2'), createdAt: '2026-10-06',
    message: '안녕하세요! 프로필에서 Spring Boot와 MySQL로 API를 설계해 본 경험을 보고 연락드려요. 커뮤니티 봇 백엔드를 같이 만들면 좋겠어요.',
    matched: [
      { category: 'role', text: 'Backend' },
      { category: 'stack', text: 'Java 실전 경험' },
      { category: 'field', text: 'AI, 웹' },
    ],
    unmatched: [
      { category: 'purpose', text: '실사용 서비스, 학습' },
      { category: 'collab', text: '비동기 소통 선호, 문서화 선호' },
    ],
  },
  {
    id: 'pr2', kind: 'apply', direction: 'received', status: 'pending', read: false,
    project: PROJECTS.voc, role: 'Backend', roleCondition: '2명 모집, 스택 무관',
    counterpart: person('p8'), createdAt: '2026-10-06',
    message: '해커톤에서 백엔드를 두 번 맡아 봤어요. 빠르게 MVP 만드는 데 도움 드릴게요.',
    matched: [
      { category: 'role', text: 'Backend' },
      { category: 'stack', text: 'Java 심화 경험' },
      { category: 'field', text: '웹' },
    ],
    unmatched: [
      { category: 'field', text: 'AI' },
      { category: 'purpose', text: '포트폴리오' },
      { category: 'collab', text: '문서화 선호' },
    ],
  },
  {
    id: 'pr3', kind: 'offer', direction: 'received', status: 'pending', read: false,
    project: PROJECTS.lens, role: 'Backend', roleCondition: '1명 모집, Python 필수',
    counterpart: person('p10'), createdAt: '2026-10-05',
    message: '공모전 준비 중인데 백엔드를 맡아 주실 분을 찾고 있어요. 관심 있으시면 수락해 주세요!',
    matched: [{ category: 'role', text: 'Backend' }],
    unmatched: [{ category: 'stack', text: 'Python 필수: 실전 경험 이상 필요' }],
  },
  {
    id: 'pr4', kind: 'apply', direction: 'received', status: 'pending', read: false,
    project: PROJECTS.voc, role: 'Frontend', roleCondition: '1명 모집, React 우대',
    counterpart: person('p6'), createdAt: '2026-10-05',
    message: 'React로 인터랙션 많은 화면 만드는 걸 좋아해요. 단어장 화면을 예쁘게 만들어 보고 싶어요.',
    matched: [{ category: 'stack', text: 'React 실전 경험' }, { category: 'role', text: 'Frontend' }],
    unmatched: [{ category: 'purpose', text: '해커톤' }],
  },
  {
    id: 'pr5', kind: 'apply', direction: 'received', status: 'accepted', read: true,
    project: PROJECTS.voc, role: 'AI', roleCondition: '1명 모집 (마감)',
    counterpart: person('p7'), createdAt: '2026-09-28',
    message: '오답 패턴 분석 모델을 맡아 보고 싶어요.',
    reply: '환영해요! 디스코드로 연락드릴게요.',
    matched: [{ category: 'stack', text: 'Python 실전 경험' }, { category: 'field', text: 'AI' }],
    unmatched: [],
    contact: mockContactOf('p7'),
  },

  /* ---------- 보낸 내역 ---------- */
  {
    id: 'ps1', kind: 'apply', direction: 'sent', status: 'pending', read: true,
    project: PROJECTS.matjip, role: 'Frontend', roleCondition: '1명 모집, React 우대',
    counterpart: person('p4'), createdAt: '2026-10-07',
    message: '안녕하세요! 캠퍼스 맛집 지도에 관심이 있어 지원합니다. 프론트엔드 경험은 적지만 끝까지 함께할게요.',
    matched: [{ category: 'role', text: 'Frontend' }, { category: 'purpose', text: '포트폴리오' }],
    unmatched: [{ category: 'stack', text: 'React 경험 없음 (우대)' }, { category: 'field', text: '앱' }],
  },
  {
    id: 'ps2', kind: 'offer', direction: 'sent', status: 'pending', read: true,
    project: PROJECTS.voc, role: 'Backend', roleCondition: '2명 모집, 스택 무관',
    counterpart: person('p9'), createdAt: '2026-10-05',
    message: '안녕하세요, 정다온 님! 프로필을 보고 Vocarchive 팀에 함께하고 싶어서 제안드려요.',
    matched: [
      { category: 'role', text: 'Backend' },
      { category: 'stack', text: 'Java 실전 경험' },
      { category: 'field', text: '웹' },
    ],
    unmatched: [{ category: 'field', text: 'AI' }, { category: 'collab', text: '빠른 피드백' }],
  },
  {
    id: 'ps3', kind: 'offer', direction: 'sent', status: 'declined', read: false,
    project: PROJECTS.voc, role: 'Frontend', roleCondition: '1명 모집, React 우대',
    counterpart: person('p11'), createdAt: '2026-10-03',
    message: '안녕하세요, 최유나 님! React 경험을 보고 제안드려요.',
    reply: '제안 감사해요! 이번 학기는 다른 프로젝트를 하고 있어서 어려울 것 같아요.',
    matched: [{ category: 'stack', text: 'React 심화 경험' }],
    unmatched: [{ category: 'field', text: 'AI' }],
  },
  {
    id: 'ps4', kind: 'apply', direction: 'sent', status: 'declined', read: true,
    project: PROJECTS.mcmory, role: 'Backend', roleCondition: '1명 모집, Java 필수',
    counterpart: person('p5'), createdAt: '2026-09-24',
    message: '선물 큐레이션 서비스에 관심이 있어 지원합니다.',
    reply: '지원 감사해요. 이번에는 다른 분과 함께하게 됐어요.',
    matched: [{ category: 'role', text: 'Backend' }],
    unmatched: [{ category: 'field', text: '앱' }],
  },
  {
    id: 'ps5', kind: 'offer', direction: 'sent', status: 'canceled', read: true,
    project: PROJECTS.voc, role: 'Backend', roleCondition: '2명 모집, 스택 무관',
    counterpart: person('p1'), createdAt: '2026-09-20',
    message: '안녕하세요, 김도현 님! Vocarchive 팀에 함께하고 싶어서 제안드려요.',
    matched: [{ category: 'role', text: 'Backend' }],
    unmatched: [{ category: 'stack', text: '주력 스택 기초 경험' }],
  },
];