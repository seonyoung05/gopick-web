// src/pages/project-form/ProjectFormPage.tsx
// 프로젝트 모집 등록 · 수정 (Figma 03). 사이드바 "내 프로젝트" 화면
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { ApiError, ERROR_CODE, projectsApi, type MyProject, type ProjectDetail } from '../../api';
import {
  toProjectCreateRequest,
  toProjectForm,
  toProjectUpdateRequest,
} from '../../api/mappers/project';
import { useToast } from '../../components/common/Toast';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { useAuth } from '../../stores/auth';
import { LeaveProjectModal } from '../projects/LeaveProjectModal';
import { toLeaveTarget } from '../projects/leaveTarget';
import { useLeaveProject } from '../projects/useLeaveProject';
import { BasicInfoSection } from './BasicInfoSection';
import { CollabSection } from './CollabSection';
import { CurrentTeamSection } from './CurrentTeamSection';
import { PostSection } from './PostSection';
import { RecruitSection } from './RecruitSection';
import { ReferenceSection } from './ReferenceSection';
import { TeamSummary } from './TeamSummary';
import { emptyForm, requiredItems, type ProjectFormValues } from './formModel';
import s from './ProjectFormPage.module.css';

const NEW = 'new';
/** 서버 텍스트 칸 최대 길이 */
const MAX_TEXT = 255;

const STATUS_LABEL: Record<ProjectDetail['lifecycleStatus'], string> = {
  PREPARING: '모집 중',
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
};

/** 255자를 넘은 칸 이름들 */
function tooLongFields(form: ProjectFormValues) {
  const texts: [string, string][] = [
    ['프로젝트명', form.name],
    ['프로젝트 설명', form.description],
    ['추가 안내', form.extraNote],
    ['프로젝트 추진 배경', form.background],
    ['구체적인 목표', form.goal],
    ['함께하고 싶은 팀원', form.wantedTeam],
  ];
  return texts.filter(([, v]) => v.trim().length > MAX_TEXT).map(([label]) => label);
}

function saveErrorText(e: unknown) {
  if (!(e instanceof ApiError)) return '저장하지 못했어요. 잠시 후 다시 시도해 주세요.';
  if (e.code === ERROR_CODE.VALIDATION_ERROR) {
    const first = Object.values(e.fieldErrors)[0];
    return `입력값을 확인해 주세요. ${first ?? e.message}`;
  }
  if (e.code === ERROR_CODE.PROJECT_ACCESS_DENIED) return '팀장만 프로젝트를 수정할 수 있어요.';
  if (e.code === ERROR_CODE.PROFILE_NOT_FOUND) return '프로필을 먼저 만들어 주세요.';
  return e.message;
}

export default function ProjectFormPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { account, profileName } = useAuth();
  const myProfileId = account?.profileId;
  const [params] = useSearchParams();

  /** 내가 팀장인 프로젝트 (완료한 프로젝트는 제외) — 위쪽 칩 목록 */
  const [myProjects, setMyProjects] = useState<MyProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string>(NEW);
  /** 지금 수정 중인 프로젝트의 상세 (경험 조건·링크까지 있어야 저장할 때 지워지지 않아요) */
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  /** 프로젝트 탈퇴 모달이 열려 있는지 */
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [form, setForm] = useState<ProjectFormValues>(emptyForm);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  // 내 프로젝트 불러오기 → ?id=new 면 새 프로젝트, ?id=번호 면 그 프로젝트, 없으면 첫 프로젝트를 편집
  const wantedId = params.get('id');
  useEffect(() => {
    let ignore = false;
    projectsApi
      .myProjects()
      .then((list) => {
        if (ignore) return;
        const mine = list.filter((p) => p.myAuthority === 'LEADER' && p.lifecycleStatus !== 'COMPLETED');
        setMyProjects(mine);
        const first =
          wantedId === NEW ? undefined : (mine.find((p) => String(p.projectId) === wantedId) ?? mine[0]);
        setSelectedId(first ? String(first.projectId) : NEW);
        setDetailLoading(Boolean(first));
      })
      .catch(() => {
        if (!ignore) toast('내 프로젝트를 불러오지 못했어요. 새 프로젝트는 등록할 수 있어요');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [myProfileId, wantedId, toast, reloadKey]);

  // 고른 프로젝트의 상세를 불러와 폼 채우기
  useEffect(() => {
    if (selectedId === NEW) return;
    let ignore = false;
    projectsApi
      .get(Number(selectedId))
      .then((res) => {
        if (ignore) return;
        setDetail(res);
        setForm(toProjectForm(res));
      })
      .catch(() => {
        if (!ignore) toast('프로젝트를 불러오지 못했어요');
      })
      .finally(() => {
        if (!ignore) setDetailLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [selectedId, toast]);

  const editing = detail && String(detail.projectId) === selectedId ? detail : undefined;
  /** 모집이 끝나고 진행 중인 프로젝트 → 추천 없이 정보만 수정 */
  const ongoing = editing?.lifecycleStatus === 'IN_PROGRESS';
  const pageTitle = editing ? `${editing.title} 수정` : '새 프로젝트 등록';

  const update = (patch: Partial<ProjectFormValues>) => setForm((prev) => ({ ...prev, ...patch }));

  const select = (id: string) => {
    if (id === selectedId) return;
    setSelectedId(id);
    setDetail(null);
    setDetailLoading(id !== NEW);
    setForm(emptyForm());
    setShowErrors(false);
    setNotice(null);
  };

  // 탈퇴가 끝나면 목록을 다시 불러와요 (내가 더 이상 팀장이 아닌 프로젝트는 목록에서 빠져요)
  const { leave, delegateAndLeave } = useLeaveProject({
    myProfileId,
    author: profileName ?? '나',
    onDone: () => {
      select(NEW);
      setReloadKey((k) => k + 1);
    },
  });
  const leaveTarget = editing && leaveOpen ? toLeaveTarget(editing, myProfileId) : null;

  /** 프로젝트 삭제 (팀장만) */
  const handleDelete = async () => {
    if (!editing) return;
    if (!window.confirm(`'${editing.title}' 프로젝트를 삭제할까요? 삭제하면 되돌릴 수 없어요.`)) return;
    setDeleting(true);
    try {
      await projectsApi.remove(editing.projectId);
      toast('프로젝트를 삭제했어요');
      select(NEW);
      setReloadKey((k) => k + 1);
    } catch (e) {
      setNotice({ tone: 'error', text: saveErrorText(e) });
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    setShowErrors(true);
    if (!requiredItems(form).every((it) => it.done)) {
      setNotice({ tone: 'error', text: '추천에 필요한 항목을 먼저 채워 주세요. 빨간 항목을 확인해 주세요.' });
      return;
    }
    const long = tooLongFields(form);
    if (long.length > 0) {
      setNotice({ tone: 'error', text: `${long.join(', ')}은(는) ${MAX_TEXT}자 이내로 적어 주세요.` });
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      if (editing) {
        await projectsApi.update(editing.projectId, toProjectUpdateRequest(form));
        toast('프로젝트를 저장했어요', 'success');
        // 진행 중 프로젝트는 추천으로 넘어가지 않고 이 화면에 그대로
        if (ongoing) return;
      } else {
        await projectsApi.create(toProjectCreateRequest(form));
        toast('프로젝트를 등록했어요', 'success');
      }
      // TODO: 추천 API가 생기면 이 프로젝트 기준으로 추천 받기 (?projectId=)
      navigate('/recommend');
    } catch (e) {
      setNotice({ tone: 'error', text: saveErrorText(e) });
    } finally {
      setSaving(false);
    }
  };

  const sectionProps = { form, update, showErrors };

  return (
    <div className={s.page}>
      <h1 className={`t-h1 ${s.heading}`}>{pageTitle}</h1>
      <p className={s.sub}>
        {ongoing ? (
          <>진행 중인 프로젝트예요. 모집이 끝나서 추천 없이 프로젝트 정보만 고칠 수 있어요.</>
        ) : (
          <>
            <em>추천 필수</em> 항목을 채우면 팀원 추천을 받을 수 있어요. 직접 검색만 할 거라면 비워 둬도 괜찮아요.
          </>
        )}
      </p>

      <div className={s.projects}>
        <span className={s.projectsLabel}>내 프로젝트</span>
        <Chip selected={selectedId === NEW} selectedStyle="filled" onClick={() => select(NEW)}>
          <Plus size={14} aria-hidden="true" /> 새 프로젝트
        </Chip>
        {loading && <span className={s.projectsLabel}>불러오는 중…</span>}
        {myProjects.map((p) => (
          <Chip
            key={p.projectId}
            selected={selectedId === String(p.projectId)}
            selectedStyle="filled"
            onClick={() => select(String(p.projectId))}
          >
            {p.title} · {STATUS_LABEL[p.lifecycleStatus]}
          </Chip>
        ))}
      </div>

      <div className={s.layout}>
        <form className={s.card} onSubmit={(e) => e.preventDefault()} noValidate>
          <BasicInfoSection {...sectionProps} />
          <RecruitSection {...sectionProps} />
          <CollabSection {...sectionProps} />
          <CurrentTeamSection
            {...sectionProps}
            isNew={!editing}
            members={editing?.members}
            projectId={editing ? String(editing.projectId) : undefined}
          />
          <ReferenceSection {...sectionProps} />
          <PostSection {...sectionProps} />

          {notice && (
            <p className={notice.tone === 'ok' ? s.noticeOk : s.noticeError} role="status">
              {notice.text}
            </p>
          )}
          <div className={s.footer}>
            {editing && (
              <div className={s.dangerActions}>
                <Button variant="ghost" className={s.dangerButton} onClick={() => setLeaveOpen(true)}>
                  프로젝트 탈퇴
                </Button>
                <Button variant="ghost" className={s.dangerButton} onClick={handleDelete} disabled={deleting}>
                  {deleting ? '삭제 중…' : '프로젝트 삭제'}
                </Button>
              </div>
            )}
            {ongoing && editing ? (
              // 진행 중: 추천 대신 이 프로젝트의 진행 현황으로
              <Button variant="ghost" onClick={() => navigate(`/projects?tab=ongoing&project=${editing.projectId}`)}>
                진행 현황 보기
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => navigate('/search')}>
                조건 없이 사람 검색하기
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving || loading || detailLoading}>
              {saving
                ? '저장 중…'
                : !editing
                  ? '등록하고 팀원 추천받기'
                  : ongoing
                    ? '저장'
                    : '저장하고 팀원 추천받기'}
            </Button>
          </div>
        </form>

        <TeamSummary form={form} />
      </div>

      <LeaveProjectModal
        target={leaveTarget}
        onClose={() => setLeaveOpen(false)}
        onLeave={() => leave(editing!)}
        onDelegateAndLeave={(targetProfileId) => delegateAndLeave(editing!, targetProfileId)}
      />
    </div>
  );
}
