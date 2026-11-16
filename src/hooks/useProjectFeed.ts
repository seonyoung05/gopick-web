// src/hooks/useProjectFeed.ts
// 홈 · 프로젝트 검색이 함께 쓰는 프로젝트 목록 (GET /projects)
// 모집 중 / 진행 중 / 완료로 나눠 화면 카드 모양으로 바꾸고, 스크랩 · 지원하기까지 처리해요.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { participationApi, projectsApi, type ProjectListItem } from '../api';
import { participationErrorText } from '../api/mappers/participation';
import { lastActiveAt, myMembership, roleToApi, toRecruitProject, toTeamProject } from '../api/mappers/project';
import { useToast } from '../components/common/Toast';
import type { ApplyPayload } from '../pages/projects/ApplyModal';
import { useAuth } from '../stores/auth';

type LoadStatus = 'loading' | 'error' | 'done';

export function useProjectFeed() {
  const toast = useToast();
  const { account } = useAuth();
  const myProfileId = account?.profileId;

  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [scrapIds, setScrapIds] = useState<Set<string>>(new Set());
  /** 내가 지원하고 답을 기다리는 프로젝트 */
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    Promise.all([projectsApi.list(), projectsApi.myScraps()])
      .then(([list, scraps]) => {
        if (ignore) return;
        setProjects(list);
        setScrapIds(new Set(scraps.map((p) => String(p.projectId))));
        setStatus('done');
      })
      .catch(() => {
        if (!ignore) setStatus('error');
      });
    participationApi
      .sent()
      .then((sent) => {
        if (ignore) return;
        setAppliedIds(
          new Set(sent.filter((r) => r.type === 'APPLY' && r.status === 'PENDING').map((r) => String(r.projectId))),
        );
      })
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const retry = useCallback(() => {
    setStatus('loading');
    setReloadKey((k) => k + 1);
  }, []);

  /** 최근 활동순으로 모집 중 · 진행 중 · 완료 나누기 */
  const lists = useMemo(() => {
    const sorted = [...projects].sort((a, b) => lastActiveAt(b).localeCompare(lastActiveAt(a)));
    const scrapped = (p: ProjectListItem) => scrapIds.has(String(p.projectId));
    return {
      // 공개 모집 중인 준비 중 프로젝트 + 모집을 닫아 둔 내 준비 중 프로젝트
      recruit: sorted
        .filter((p) => p.lifecycleStatus === 'PREPARING' && (p.recruiting || myMembership(p, myProfileId).isMember))
        .map((p) => toRecruitProject(p, { myProfileId, scrapped: scrapped(p) })),
      ongoing: sorted
        .filter((p) => p.lifecycleStatus === 'IN_PROGRESS')
        .map((p) => toTeamProject(p, { scrapped: scrapped(p), myProfileId })),
      done: sorted
        .filter((p) => p.lifecycleStatus === 'COMPLETED')
        .map((p) => toTeamProject(p, { scrapped: scrapped(p), myProfileId })),
    };
  }, [projects, scrapIds, myProfileId]);

  const toggleScrap = useCallback(
    async (id: string) => {
      const was = scrapIds.has(id);
      const set = (on: boolean) =>
        setScrapIds((prev) => {
          const next = new Set(prev);
          if (on) next.add(id);
          else next.delete(id);
          return next;
        });
      set(!was);
      try {
        if (was) await projectsApi.unscrap(Number(id));
        else await projectsApi.scrap(Number(id));
        toast(was ? '스크랩을 해제했어요' : '프로젝트를 스크랩했어요', was ? undefined : 'success');
      } catch {
        set(was);
        toast('스크랩하지 못했어요. 잠시 후 다시 시도해 주세요');
      }
    },
    [scrapIds, toast],
  );

  /** 지원하기. 성공하면 true (모달 닫기용) */
  const apply = useCallback(
    async ({ projectId, role }: ApplyPayload) => {
      try {
        await participationApi.create(Number(projectId), { type: 'APPLY', role: roleToApi(role) });
        setAppliedIds((prev) => new Set(prev).add(projectId));
        toast('지원했어요. 등록자가 수락하면 팀에 합류해요', 'success');
        return true;
      } catch (e) {
        toast(participationErrorText(e, 'apply'));
        return false;
      }
    },
    [toast],
  );

  return { status, retry, ...lists, appliedIds, toggleScrap, apply };
}
