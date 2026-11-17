// src/pages/recommend/useRecommendations.ts
// 프로젝트 + 역할 하나에 대한 추천 불러오기
// - AI를 거쳐서 느릴 수 있어서, 한 번 받은 결과는 이 화면에 있는 동안 기억해 둬요 (역할 탭을 왔다 갔다 해도 다시 안 부름)
// - 카드에 필요한 학과·기술은 공개 프로필 목록(GET /profiles)에서 한 번에 채워요
import { useEffect, useRef, useState } from 'react';
import {
  ApiError,
  ERROR_CODE,
  profilesApi,
  recommendationsApi,
  type ProjectRole,
} from '../../api';
import { personFromSearch } from '../../api/mappers/person';
import { toRecommendation } from '../../api/mappers/recommendation';
import type { PersonSummary } from '../../types/person';
import type { Recommendation } from '../../types/recommendation';

export type RecommendState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'done'; items: Recommendation[] };

function errorText(e: unknown) {
  if (e instanceof ApiError) {
    if (e.code === ERROR_CODE.PROJECT_ACCESS_DENIED) return '팀장만 추천을 받을 수 있어요.';
    if (e.code === ERROR_CODE.PROJECT_NOT_FOUND) return '삭제됐거나 찾을 수 없는 프로젝트예요.';
    if (e.code === ERROR_CODE.VALIDATION_ERROR) return '이 프로젝트에서 모집하지 않는 역할이에요.';
    if (e.code === ERROR_CODE.NETWORK_ERROR) return '서버에 연결하지 못했어요. 인터넷 연결을 확인해 주세요.';
  }
  return '추천을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.';
}

/** 같은 순위끼리는 이름순 */
const byRank = (a: Recommendation, b: Recommendation) =>
  a.rank - b.rank || a.person.name.localeCompare(b.person.name, 'ko');

export function useRecommendations(projectId: number | null, role: ProjectRole | null) {
  const [state, setState] = useState<RecommendState>({ status: 'idle' });
  const [reloadKey, setReloadKey] = useState(0);
  /** "프로젝트:역할" → 받은 추천 */
  const cache = useRef(new Map<string, Recommendation[]>());
  /** 공개 프로필 목록은 한 번만 불러와요 */
  const people = useRef<Promise<Map<number, PersonSummary>> | null>(null);

  const key = projectId != null && role ? `${projectId}:${role}` : null;

  useEffect(() => {
    if (projectId == null || !role || !key) return;
    const cached = cache.current.get(key);
    if (cached) {
      setState({ status: 'done', items: cached });
      return;
    }

    let ignore = false;
    setState({ status: 'loading' });

    if (!people.current) {
      people.current = profilesApi
        .search()
        .then((list) => new Map(list.map((p) => [p.profileId, personFromSearch(p)])))
        .catch(() => {
          people.current = null; // 다음에 다시 시도
          return new Map<number, PersonSummary>(); // 프로필이 없어도 이름만으로 카드는 보여 줘요
        });
    }

    Promise.all([recommendationsApi.get(projectId, role), people.current])
      .then(([res, byId]) => {
        const items = res.items.map((it) => toRecommendation(it, byId.get(it.profileId))).sort(byRank);
        cache.current.set(key, items);
        if (!ignore) setState({ status: 'done', items });
      })
      .catch((e) => {
        if (!ignore) setState({ status: 'error', message: errorText(e) });
      });

    return () => {
      ignore = true;
    };
  }, [projectId, role, key, reloadKey]);

  /** 다시 추천 받기 (기억해 둔 결과를 버리고 AI에 다시 요청) */
  const reload = () => {
    if (key) cache.current.delete(key);
    setReloadKey((k) => k + 1);
  };

  return { state, reload };
}
