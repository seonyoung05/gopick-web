// src/pages/projects/ProjectsPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ApiError,
  ERROR_CODE,
  participationApi,
  projectsApi,
  type ProjectData as ApiProject,
} from '../../api';
import { participationErrorText } from '../../api/mappers/participation';
import {
  API_STAGES,
  lastActiveAt,
  myMembership,
  roleToApi,
  toRecruitProject,
  toTeamProject,
} from '../../api/mappers/project';
import { useToast } from '../../components/common/Toast';
import { Button } from '../../components/ui/Button';
import { Tabs, type TabItem } from '../../components/ui/Tabs';
import { useAuth } from '../../stores/auth';
import type { ActivityLog, OutputLink, RecruitProject, StageTask, TeamProject } from '../../types/project';
import { ApplyModal, type ApplyPayload } from './ApplyModal';
import { monthDay } from './formatDate';
import { RecruitCard } from './RecruitCard';
import { ProjectListItem } from './ProjectListItem';
import { ProjectDetail } from './ProjectDetail';
import styles from './ProjectsPage.module.css';

type TabKey = 'recruit' | 'ongoing' | 'done';
type TeamTabKey = Exclude<TabKey, 'recruit'>;
type LoadStatus = 'loading' | 'error' | 'done';

const TAB_KEYS: readonly TabKey[] = ['recruit', 'ongoing', 'done'];

/** 서버 에러 → 안내 문구 */
function errorText(e: unknown, fallback: string) {
  if (!(e instanceof ApiError)) return fallback;
  if (e.code === ERROR_CODE.PROJECT_ACCESS_DENIED) return '이 작업은 팀 구성원(팀장)만 할 수 있어요';
  if (e.code === ERROR_CODE.INVALID_PROJECT_STATE) return '지금 프로젝트 상태에서는 할 수 없는 작업이에요';
  if (e.code === ERROR_CODE.PROJECT_NOT_FOUND) return '더 이상 없는 프로젝트예요';
  return fallback;
}

export default function ProjectsPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { account, profileName } = useAuth();
  // 활동 기록에 남길 이름 (프로필이 아직 없으면 '나')
  const author = profileName ?? '나';
  // 활동 기록 API가 아직 없어서, 새 기록은 이 화면 안에서만 보관해요 (새로고침하면 사라져요)
  const [newLogs, setNewLogs] = useState<Record<string, ActivityLog[]>>({});
  // 세부 과제 API가 아직 없어서, 과제 수정은 이 화면 안에서만 보관해요 (새로고침하면 사라져요)
  const [taskEdits, setTaskEdits] = useState<Record<string, StageTask[][]>>({});
  const editTasks = (base: TeamProject, fn: (tasks: StageTask[][]) => StageTask[][]) =>
    setTaskEdits((prev) => ({ ...prev, [base.id]: fn(prev[base.id] ?? base.tasks) }));
  const addLog = (id: string, text: string) =>
    setNewLogs((prev) => ({ ...prev, [id]: [{ date: monthDay(), author, text }, ...(prev[id] ?? [])] }));
  const myProfileId = account?.profileId;

  const [params, setParams] = useSearchParams();
  const raw = params.get('tab');
  const tab: TabKey = TAB_KEYS.find((k) => k === raw) ?? 'recruit';

  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [scrapIds, setScrapIds] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  // ?project=번호 로 들어오면(내 프로젝트의 "진행 현황 보기") 그 프로젝트를 골라 둔 채로 열기
  const [selected, setSelected] = useState<Partial<Record<TeamTabKey, string>>>(() => {
    const id = params.get('project');
    return id && tab !== 'recruit' ? { [tab]: id } : {};
  });
  /** 지원하기 모달을 연 프로젝트 */
  const [applyTarget, setApplyTarget] = useState<RecruitProject | null>(null);
  /** 내가 지원해 두고 아직 답을 기다리는 프로젝트 */
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let ignore = false;
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
  }, []);

  const submitApply = async ({ projectId, role }: ApplyPayload) => {
    try {
      await participationApi.create(Number(projectId), { type: 'APPLY', role: roleToApi(role) });
      setAppliedIds((prev) => new Set(prev).add(projectId));
      setApplyTarget(null);
      toast('지원했어요. 등록자가 수락하면 팀에 합류해요', 'success');
    } catch (e) {
      toast(participationErrorText(e, 'apply'));
    }
  };

  // 전체 프로젝트(팀원·모집 포함) + 내 스크랩 불러오기
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
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setStatus('loading');
    setReloadKey((k) => k + 1);
  };

  // 탭별로 나누고 최근 활동순 정렬
  const lists = useMemo(() => {
    const sorted = [...projects].sort((a, b) => lastActiveAt(b).localeCompare(lastActiveAt(a)));
    const scrapped = (p: ApiProject) => scrapIds.has(String(p.projectId));
    return {
      // 준비 중인 프로젝트 중 공개 모집 중인 것 + 내가 팀원인 것(모집을 닫아 둔 내 프로젝트도 보이게)
      recruit: sorted
        .filter(
          (p) => p.lifecycleStatus === 'PREPARING' && (p.recruiting || myMembership(p, myProfileId).isMember),
        )
        .map((p) => toRecruitProject(p, { myProfileId, scrapped: scrapped(p) })),
      ongoing: sorted
        .filter((p) => p.lifecycleStatus === 'IN_PROGRESS')
        .map((p) => toTeamProject(p, { scrapped: scrapped(p) })),
      done: sorted
        .filter((p) => p.lifecycleStatus === 'COMPLETED')
        .map((p) => toTeamProject(p, { scrapped: scrapped(p) })),
    };
  }, [projects, scrapIds, myProfileId]);

  const findProject = (id: string) => projects.find((p) => String(p.projectId) === id);

  // 진행 중·완료 탭에서 보고 있는 프로젝트는 상세를 불러와 결과물 링크까지 채워요 (목록에는 링크가 없어요)
  const teamTab = tab === 'recruit' ? null : tab;
  const viewingId = teamTab ? (lists[teamTab].find((p) => p.id === selected[teamTab]) ?? lists[teamTab][0])?.id : undefined;
  const viewingNeedsDetail = viewingId !== undefined && findProject(viewingId)?.links === undefined;
  useEffect(() => {
    if (!viewingId || !viewingNeedsDetail) return;
    let ignore = false;
    projectsApi
      .get(Number(viewingId))
      .then((fresh) => {
        if (!ignore) setProjects((prev) => prev.map((p) => (p.projectId === fresh.projectId ? fresh : p)));
      })
      .catch(() => undefined); // 실패해도 목록 정보로 그대로 보여줌
    return () => {
      ignore = true;
    };
  }, [viewingId, viewingNeedsDetail]);

  /** 한 프로젝트만 다시 불러와서 교체 (시작·단계 변경·완료 뒤) */
  const refreshOne = async (id: string) => {
    const fresh = await projectsApi.get(Number(id));
    setProjects((prev) => prev.map((p) => (p.projectId === fresh.projectId ? fresh : p)));
  };

  const toggleScrap = async (id: string) => {
    const wasScrapped = scrapIds.has(id);
    const apply = (on: boolean) =>
      setScrapIds((prev) => {
        const next = new Set(prev);
        if (on) next.add(id);
        else next.delete(id);
        return next;
      });

    apply(!wasScrapped);
    try {
      if (wasScrapped) await projectsApi.unscrap(Number(id));
      else await projectsApi.scrap(Number(id));
      toast(wasScrapped ? '스크랩을 해제했어요' : '프로젝트를 스크랩했어요', wasScrapped ? undefined : 'success');
    } catch (e) {
      apply(wasScrapped);
      toast(errorText(e, '스크랩하지 못했어요. 잠시 후 다시 시도해 주세요'));
    }
  };

  const startProject = async (id: string) => {
    if (!window.confirm('모집을 마치고 진행을 시작할까요? 시작하면 공개 모집이 닫혀요.')) return;
    try {
      await projectsApi.start(Number(id));
      await refreshOne(id);
      toast('프로젝트를 시작했어요', 'success');
      setSelected((s) => ({ ...s, ongoing: id }));
      setParams({ tab: 'ongoing' });
    } catch (e) {
      toast(errorText(e, '프로젝트를 시작하지 못했어요'));
    }
  };

  const changeStage = async (id: string, stageIndex: number) => {
    try {
      await projectsApi.changeStage(Number(id), API_STAGES[stageIndex]);
      await refreshOne(id);
      toast('진행 단계를 바꿨어요', 'success');
    } catch (e) {
      toast(errorText(e, '단계를 바꾸지 못했어요'));
    }
  };

  /** 프로젝트 나가기 (팀장이 아닌 팀원) */
  const leaveProject = async (id: string) => {
    const title = findProject(id)?.title ?? '이 프로젝트';
    if (!window.confirm(`'${title}'에서 나갈까요? 다시 참여하려면 지원하거나 제안을 받아야 해요.`)) return;
    try {
      await projectsApi.leave(Number(id));
      toast('프로젝트에서 나왔어요');
      setStatus('loading');
      setReloadKey((k) => k + 1);
    } catch (e) {
      toast(errorText(e, '프로젝트에서 나가지 못했어요'));
    }
  };

  const completeProject = async (id: string, outputs: OutputLink[]) => {
    try {
      // 완료 API는 산출물을 받지 않아서, 먼저 프로젝트 링크로 저장한 뒤 완료 처리해요 (기존 링크는 유지)
      const existing = findProject(id)?.links ?? [];
      const added = outputs
        .filter((o) => !existing.some((l) => l.url === o.url))
        .map((o) => ({ type: o.label, url: o.url }));
      if (added.length > 0) await projectsApi.update(Number(id), { links: [...existing, ...added] });
      await projectsApi.complete(Number(id));
      await refreshOne(id);
      toast('프로젝트를 완료했어요', 'success');
      setSelected((s) => ({ ...s, done: id }));
      setParams({ tab: 'done' });
    } catch (e) {
      toast(errorText(e, '프로젝트를 완료하지 못했어요'));
    }
  };

  const tabItems: TabItem<TabKey>[] = [
    { value: 'recruit', label: `모집 중 ${lists.recruit.length}` },
    { value: 'ongoing', label: `진행 중 ${lists.ongoing.length}` },
    { value: 'done', label: `완료 · 아카이브 ${lists.done.length}` },
  ];

  const empty = (title: string, text: string) => (
    <div className={styles.empty}>
      <strong>{title}</strong>
      {text}
    </div>
  );

  const renderTeamTab = (key: TeamTabKey) => {
    const list = lists[key];
    if (list.length === 0) {
      return key === 'ongoing'
        ? empty('진행 중인 프로젝트가 없어요', '모집을 마치고 시작한 프로젝트가 여기에 모여요.')
        : empty('완료한 프로젝트가 없어요', '완료한 프로젝트는 여기에서 다시 볼 수 있어요.');
    }

    const base = list.find((p) => p.id === selected[key]) ?? list[0];
    const current = { ...base, tasks: taskEdits[base.id] ?? base.tasks, log: [...(newLogs[base.id] ?? []), ...base.log] };
    const raw = findProject(current.id);
    const { isMember, isLeader } = raw ? myMembership(raw, myProfileId) : { isMember: false, isLeader: false };
    const canEdit = key === 'ongoing' && isMember;

    return (
      <div className={styles.split}>
        <div className={styles.list}>
          {list.map((p) => (
            <ProjectListItem
              key={p.id}
              project={p}
              selected={p.id === current.id}
              onSelect={() => setSelected((s) => ({ ...s, [key]: p.id }))}
              onToggleScrap={() => toggleScrap(p.id)}
            />
          ))}
        </div>
        <ProjectDetail
          key={current.id}
          project={current}
          editable={canEdit}
          author={author}
          onAddLog={(text) => addLog(current.id, text)}
          onToggleScrap={() => toggleScrap(current.id)}
          onToggleTask={(stage, ti, done) =>
            editTasks(current, (all) =>
              all.map((list, si) => (si === stage ? list.map((t, i) => (i === ti ? { ...t, done } : t)) : list)),
            )
          }
          onAddTask={(stage, text) =>
            editTasks(current, (all) => all.map((list, si) => (si === stage ? [...list, { text, done: false }] : list)))
          }
          onRemoveTask={(stage, ti) =>
            editTasks(current, (all) => all.map((list, si) => (si === stage ? list.filter((_, i) => i !== ti) : list)))
          }
          onChangeStage={canEdit ? (index) => changeStage(current.id, index) : undefined}
          onComplete={canEdit && isLeader ? (outputs) => completeProject(current.id, outputs) : undefined}
          onLeave={key === 'ongoing' && isMember && !isLeader ? () => leaveProject(current.id) : undefined}
        />
      </div>
    );
  };

  const renderBody = () => {
    if (status === 'loading') return empty('프로젝트를 불러오는 중이에요…', '');
    if (status === 'error') {
      return (
        <div className={styles.empty}>
          <strong>프로젝트를 불러오지 못했어요</strong>
          잠시 후 다시 시도해 주세요.
          <div className={styles.emptyAction}>
            <Button variant="ghost" size="sm" onClick={retry}>
              다시 불러오기
            </Button>
          </div>
        </div>
      );
    }
    if (tab !== 'recruit') return renderTeamTab(tab);
    if (lists.recruit.length === 0) {
      return (
        <div className={styles.empty}>
          <strong>모집 중인 프로젝트가 없어요</strong>
          직접 프로젝트를 등록하고 팀원을 모아 보세요.
          <div className={styles.emptyAction}>
            <Button size="sm" onClick={() => navigate('/manage')}>
              프로젝트 등록하기
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className={styles.recruitList}>
        {lists.recruit.map((p) => (
          <RecruitCard
            key={p.id}
            project={p}
            onToggleScrap={() => toggleScrap(p.id)}
            applied={appliedIds.has(p.id)}
            onApply={() => setApplyTarget(p)}
            onEdit={() => navigate(`/manage?id=${p.id}`)}
            onRecommend={() => navigate('/recommend')}
            onStart={() => startProject(p.id)}
            onLeave={() => leaveProject(p.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <h1 className={`t-h1 ${styles.heading}`}>프로젝트 목록</h1>
      <p className={styles.sub}>
        모집 중 · 진행 중 · 완료로 나눠 보여줘요. 각 탭 안에서는 최근 활동순이고, 모든 팀의 진행 정보는 공개돼요.
      </p>

      <Tabs
        className={styles.tabs}
        aria-label="프로젝트 상태"
        items={tabItems}
        value={tab}
        onChange={(value) => setParams({ tab: value })}
      />

      {renderBody()}

      <ApplyModal project={applyTarget} onClose={() => setApplyTarget(null)} onSubmit={submitApply} />
    </div>
  );
}
