// src/pages/recommend/RecommendPage.tsx
// 팀원 추천 (/recommend?projectId=7&role=BACKEND)
// - 내가 팀장인 모집 중 프로젝트 · 모집 역할 하나 기준으로 서버(AI) 추천을 받아요
// - 주소에 프로젝트·역할이 없으면 첫 번째 프로젝트 · 첫 번째 모집 역할
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { ApiError, ERROR_CODE, profilesApi, projectsApi, type MyProject, type ProjectRole } from '../../api';
import { personFromDetail } from '../../api/mappers/person';
import { participationErrorText } from '../../api/mappers/participation';
import { roleLabel } from '../../api/mappers/project';
import { Chip } from '../../components/ui/Chip';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/common/Toast';
import { ProfileDetailModal } from '../../components/common/ProfileDetailModal';
import { OfferModal, type OfferPayload } from '../../components/common/OfferModal';
import { useOfferContext } from '../../hooks/useOfferContext';
import type { PersonSummary } from '../../types/person';
import { MatchCard } from './MatchCard';
import { useRecommendations } from './useRecommendations';
import styles from './RecommendPage.module.css';

type LoadStatus = 'loading' | 'error' | 'done';

/** 추천 탭에 보여 줄 역할: 남은 인원이 있는 모집 역할 (없으면 등록된 모집 역할 전부) */
function rolesOf(p: MyProject) {
  const open = p.recruitments.filter((r) => r.remainingCount > 0);
  return open.length > 0 ? open : p.recruitments;
}

const attrText = (p: MyProject, category: 'FIELD' | 'PURPOSE') =>
  p.attributes
    .filter((a) => a.category === category)
    .map((a) => a.value)
    .join(', ');

export default function RecommendPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const offer = useOfferContext();
  const { relationOf } = offer;

  /* ---------- 내 모집 중 프로젝트 ---------- */
  const [projects, setProjects] = useState<MyProject[]>([]);
  const [projectStatus, setProjectStatus] = useState<LoadStatus>('loading');
  const [projectReload, setProjectReload] = useState(0);

  useEffect(() => {
    let ignore = false;
    projectsApi
      .myProjects()
      .then((list) => {
        if (ignore) return;
        setProjects(list.filter((p) => p.myAuthority === 'LEADER' && p.lifecycleStatus === 'PREPARING'));
        setProjectStatus('done');
      })
      .catch(() => {
        if (!ignore) setProjectStatus('error');
      });
    return () => {
      ignore = true;
    };
  }, [projectReload]);

  const wantedId = params.get('projectId');
  const project = wantedId ? projects.find((p) => String(p.projectId) === wantedId) : projects[0];
  const roles = project ? rolesOf(project) : [];
  const wantedRole = params.get('role');
  const role: ProjectRole | null = roles.find((r) => r.role === wantedRole)?.role ?? roles[0]?.role ?? null;

  const { state, reload } = useRecommendations(project?.projectId ?? null, role);
  const recs = useMemo(
    () => (state.status === 'done' ? state.items.map((r) => ({ ...r, relation: relationOf(r.person.id) })) : []),
    [state, relationOf],
  );
  /** 같은 순위가 2명 이상이면 "공동" 표시 */
  const isTie = (rank: number) => recs.filter((r) => r.rank === rank).length > 1;

  const go = (projectId: number, nextRole?: ProjectRole) =>
    setParams(
      nextRole ? { projectId: String(projectId), role: nextRole } : { projectId: String(projectId) },
      { replace: true },
    );

  /* ---------- 저장 (북마크) ---------- */
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    profilesApi
      .myBookmarks()
      .then((list) => setSavedIds(new Set(list.map((b) => String(b.profileId)))))
      .catch(() => undefined);
  }, []);

  const toggleSave = async (person: PersonSummary) => {
    const wasSaved = savedIds.has(person.id);
    const apply = (on: boolean) =>
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (on) next.add(person.id);
        else next.delete(person.id);
        return next;
      });
    apply(!wasSaved);
    try {
      if (wasSaved) await profilesApi.unbookmark(Number(person.id));
      else await profilesApi.bookmark(Number(person.id));
      if (wasSaved) toast(`${person.name} 님을 저장함에서 뺐어요`);
      else toast(`${person.name} 님을 저장했어요`, 'success');
    } catch {
      apply(wasSaved);
      toast('저장을 바꾸지 못했어요. 잠시 후 다시 시도해 주세요');
    }
  };

  /* ---------- 프로필 보기 · 제안 ---------- */
  const [detailPerson, setDetailPerson] = useState<PersonSummary | null>(null);
  const [offerPerson, setOfferPerson] = useState<PersonSummary | null>(null);

  /** 성향·경험까지 있는 상세를 불러온 뒤 모달 열기 */
  const openDetail = async (person: PersonSummary) => {
    try {
      setDetailPerson(personFromDetail(await profilesApi.get(Number(person.id))));
    } catch (e) {
      if (e instanceof ApiError && e.code === ERROR_CODE.PRIVATE_PROFILE) toast('비공개로 바뀐 프로필이에요');
      else if (e instanceof ApiError && e.code === ERROR_CODE.PROFILE_NOT_FOUND) toast('더 이상 없는 프로필이에요');
      else toast('프로필을 불러오지 못했어요');
    }
  };

  const openOffer = (person: PersonSummary) => {
    setDetailPerson(null);
    setOfferPerson(person);
  };

  const handleOfferSubmit = async (payload: OfferPayload) => {
    try {
      await offer.sendOffer(payload);
      setOfferPerson(null);
      toast('참여 제안을 보냈어요', 'success');
    } catch (e) {
      toast(participationErrorText(e, 'offer'));
    }
  };

  /* ---------- 화면 ---------- */
  const renderResults = () => {
    if (state.status === 'idle' || state.status === 'loading') {
      return (
        <div className={styles.loading} role="status">
          <span className={styles.spinner} aria-hidden="true" />
          <strong>AI가 {role ? roleLabel(role) : ''} 팀원을 고르고 있어요</strong>
          <span>프로필을 하나씩 비교하느라 몇 초 걸릴 수 있어요.</span>
        </div>
      );
    }
    if (state.status === 'error') {
      return (
        <div className={styles.empty}>
          <p>{state.message}</p>
          <Button variant="ghost" size="sm" onClick={reload}>
            다시 시도
          </Button>
        </div>
      );
    }
    if (recs.length === 0) {
      return (
        <div className={styles.empty}>
          아직 조건에 맞는 추천 팀원이 없어요. 필수 조건을 줄이거나 사람 검색에서 직접 찾아보세요.
        </div>
      );
    }
    return recs.map((rec) => (
      <MatchCard
        key={rec.person.id}
        rec={rec}
        isTie={isTie(rec.rank)}
        saved={savedIds.has(rec.person.id)}
        offered={false}
        onViewProfile={() => openDetail(rec.person)}
        onToggleSave={() => toggleSave(rec.person)}
        onOffer={() => openOffer(rec.person)}
        onViewApplication={() => navigate('/offers?tab=received')}
      />
    ));
  };

  const renderBody = () => {
    if (projectStatus === 'loading') return <div className={styles.empty}>내 프로젝트를 불러오는 중이에요…</div>;
    if (projectStatus === 'error') {
      return (
        <div className={styles.empty}>
          <p>내 프로젝트를 불러오지 못했어요.</p>
          <Button variant="ghost" size="sm" onClick={() => setProjectReload((k) => k + 1)}>
            다시 불러오기
          </Button>
        </div>
      );
    }
    if (projects.length === 0) {
      return (
        <div className={styles.empty}>
          <p>추천은 내가 팀장인 모집 중 프로젝트에서 받을 수 있어요.</p>
          <Button size="sm" onClick={() => navigate('/manage?id=new')}>
            프로젝트 등록하기
          </Button>
        </div>
      );
    }
    if (!project) {
      return (
        <div className={styles.empty}>
          <p>이 프로젝트는 추천을 받을 수 없어요. 내가 팀장인 모집 중 프로젝트만 추천을 받을 수 있어요.</p>
          <Button variant="ghost" size="sm" onClick={() => go(projects[0].projectId)}>
            {projects[0].title} 추천 보기
          </Button>
        </div>
      );
    }
    if (roles.length === 0) {
      return (
        <div className={styles.empty}>
          <p>모집 역할이 없어서 추천할 수 없어요. 모집 역할을 추가해 주세요.</p>
          <Button size="sm" onClick={() => navigate(`/manage?id=${project.projectId}`)}>
            모집 역할 추가하기
          </Button>
        </div>
      );
    }

    return (
      <div className={styles.layout}>
        <section className={styles.results} aria-label="추천 결과">
          <div className={styles.chips} role="group" aria-label="모집 역할">
            {roles.map((r) => (
              <Chip key={r.role} selected={r.role === role} onClick={() => go(project.projectId, r.role)}>
                {roleLabel(r.role)} {r.remainingCount}명 모집
              </Chip>
            ))}
          </div>
          <div className={styles.metaRow}>
            <p className={styles.meta}>
              {role && roleLabel(role)} 추천 {state.status === 'done' ? `${recs.length}명` : ''} | 적합한 순, 동점은
              이름순
            </p>
            {state.status === 'done' && (
              <button type="button" className={styles.refresh} onClick={reload}>
                <RefreshCw size={14} aria-hidden="true" /> 다시 추천받기
              </button>
            )}
          </div>

          {renderResults()}

          <div className={styles.more}>
            <div>
              <strong>추천 결과가 마음에 들지 않나요?</strong>
              <p>사람 검색에서 필터를 바꿔 가며 더 다양한 사람을 찾아보세요.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/search')}>
              사람 검색으로 더 찾기
            </Button>
          </div>
        </section>

        <aside className={styles.aside} aria-label="추천 기준">
          <h2>추천 기준</h2>
          <ol className={styles.priority}>
            <li>기술 스택</li>
            <li>협업 성향</li>
            <li>프로젝트 경험</li>
          </ol>
          <ul className={styles.basis}>
            <li>AI가 위 순서대로 더 중요하게 반영해 적합한 순서로 보여줘요. 학과·소속 파트는 참고만 해요.</li>
            <li>기술·경험을 '필수'로 정한 조건을 채우지 못한 사람은 추천하지 않아요.</li>
            <li>카드마다 일치 항목과 불일치 항목을 보여줘요. 점수는 공개하지 않아요.</li>
            <li>비공개 프로필과 이미 팀원인 사람은 추천하지 않아요.</li>
          </ul>
        </aside>
      </div>
    );
  };

  const field = project ? attrText(project, 'FIELD') : '';
  const purpose = project ? attrText(project, 'PURPOSE') : '';

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <button type="button" className={styles.back} onClick={() => navigate(-1)}>
          이전으로 돌아가기
        </button>
        <h1 className="t-h1">{project ? `${project.title} 추천 팀원` : '추천 팀원'}</h1>
        {project && (
          <p>
            {[
              roles.length > 0 && `모집 ${roles.map((r) => `${roleLabel(r.role)} ${r.remainingCount}명`).join(', ')}`,
              field && `분야 ${field}`,
              purpose && `목적 ${purpose}`,
            ]
              .filter(Boolean)
              .join(' | ')}
          </p>
        )}
        {projects.length > 1 && (
          <div className={styles.chips} role="group" aria-label="내 모집 중 프로젝트">
            {projects.map((p) => (
              <Chip
                key={p.projectId}
                selected={p.projectId === project?.projectId}
                selectedStyle="filled"
                onClick={() => go(p.projectId)}
              >
                {p.title}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {renderBody()}

      <ProfileDetailModal
        person={detailPerson}
        onClose={() => setDetailPerson(null)}
        saved={detailPerson ? savedIds.has(detailPerson.id) : false}
        onToggleSave={() => detailPerson && toggleSave(detailPerson)}
        onOffer={
          detailPerson && offer.relationOf(detailPerson.id) === 'none' ? () => openOffer(detailPerson) : undefined
        }
      />

      <OfferModal
        person={offerPerson}
        projects={offer.projects}
        status={offer.status}
        defaultProjectId={project ? String(project.projectId) : undefined}
        defaultRecruitmentId={role ?? undefined}
        onClose={() => setOfferPerson(null)}
        onSubmit={handleOfferSubmit}
      />
    </div>
  );
}
