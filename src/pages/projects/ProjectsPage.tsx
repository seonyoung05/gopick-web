// src/pages/projects/ProjectsPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ApiError, ERROR_CODE, fetchProjectDetails, projectsApi, type ProjectDetail as ApiProject } from '../../api';
import {
  API_STAGES,
  lastActiveAt,
  myMembership,
  toRecruitProject,
  toTeamProject,
} from '../../api/mappers/project';
import { useToast } from '../../components/common/Toast';
import { Button } from '../../components/ui/Button';
import { Tabs, type TabItem } from '../../components/ui/Tabs';
import { useAuth } from '../../stores/auth';
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
  const { account } = useAuth();
  const myProfileId = account?.profileId;

  const [params, setParams] = useSearchParams();
  const raw = params.get('tab');
  const tab: TabKey = TAB_KEYS.find((k) => k === raw) ?? 'recruit';

  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [scrapIds, setScrapIds] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState<Partial<Record<TeamTabKey, string>>>({});

  // 전체 프로젝트(상세 포함) + 내 스크랩 불러오기
  useEffect(() => {
    let ignore = false;
    Promise.all([fetchProjectDetails(), projectsApi.myScraps()])
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

  const completeProject = async (id: string) => {
    if (!window.confirm('프로젝트를 완료할까요? 완료한 프로젝트는 다시 진행 중으로 되돌릴 수 없어요.')) return;
    try {
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

    const current = list.find((p) => p.id === selected[key]) ?? list[0];
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
          onToggleScrap={() => toggleScrap(current.id)}
          // 세부 과제는 아직 서버에 없어서 체크해도 저장되지 않음
          onToggleTask={() => undefined}
          onChangeStage={canEdit ? (index) => changeStage(current.id, index) : undefined}
          onComplete={canEdit && isLeader ? () => completeProject(current.id) : undefined}
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
            // TODO: 지원 API가 생기면 지원 모달(M2)을 연결
            onApply={() => toast('지원하기는 준비 중이에요')}
            onEdit={() => navigate(`/manage?id=${p.id}`)}
            onRecommend={() => navigate('/recommend')}
            onStart={() => startProject(p.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <h1 className={`t-h1 ${styles.heading}`}>프로젝트</h1>
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
    </div>
  );
}
