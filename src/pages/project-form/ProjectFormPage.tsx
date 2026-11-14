// src/pages/project-form/ProjectFormPage.tsx
// 프로젝트 모집 등록 · 수정 (Figma 03). 사이드바 "프로젝트 관리" 화면
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { ApiError, ERROR_CODE, fetchProjectDetails, projectsApi, type ProjectDetail } from '../../api';
import {
  myMembership,
  toProjectCreateRequest,
  toProjectForm,
  toProjectUpdateRequest,
} from '../../api/mappers/project';
import { useToast } from '../../components/common/Toast';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { useAuth } from '../../stores/auth';
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
  const { account } = useAuth();
  const myProfileId = account?.profileId;
  const [params] = useSearchParams();

  /** 내가 팀장인 프로젝트 (완료한 프로젝트는 제외) */
  const [myProjects, setMyProjects] = useState<ProjectDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>(NEW);
  const [form, setForm] = useState<ProjectFormValues>(emptyForm);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  // 내 프로젝트 불러오기 → ?id= 가 있으면 그 프로젝트, 없으면 첫 프로젝트를 편집
  const wantedId = params.get('id');
  useEffect(() => {
    let ignore = false;
    fetchProjectDetails()
      .then((list) => {
        if (ignore) return;
        const mine = list.filter(
          (p) => p.lifecycleStatus !== 'COMPLETED' && myMembership(p, myProfileId).isLeader,
        );
        setMyProjects(mine);
        const first = mine.find((p) => String(p.projectId) === wantedId) ?? mine[0];
        if (first) {
          setSelectedId(String(first.projectId));
          setForm(toProjectForm(first));
        }
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
  }, [myProfileId, wantedId, toast]);

  const editing = myProjects.find((p) => String(p.projectId) === selectedId);
  const pageTitle = editing ? `${editing.title} 수정` : '새 프로젝트 등록';

  const update = (patch: Partial<ProjectFormValues>) => setForm((prev) => ({ ...prev, ...patch }));

  const select = (id: string) => {
    const target = myProjects.find((p) => String(p.projectId) === id);
    setSelectedId(id);
    setForm(target ? toProjectForm(target) : emptyForm());
    setShowErrors(false);
    setNotice(null);
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
        <em>추천 필수</em> 항목을 채우면 팀원 추천을 받을 수 있어요. 직접 검색만 할 거라면 비워 둬도 괜찮아요.
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
          <CurrentTeamSection {...sectionProps} isNew={!editing} />
          <ReferenceSection {...sectionProps} />
          <PostSection {...sectionProps} />

          {notice && (
            <p className={notice.tone === 'ok' ? s.noticeOk : s.noticeError} role="status">
              {notice.text}
            </p>
          )}
          <div className={s.footer}>
            <Button variant="ghost" onClick={() => navigate('/search')}>
              조건 없이 사람 검색하기
            </Button>
            <Button onClick={handleSave} disabled={saving || loading}>
              {saving ? '저장 중…' : editing ? '저장하고 팀원 추천받기' : '등록하고 팀원 추천받기'}
            </Button>
          </div>
        </form>

        <TeamSummary form={form} />
      </div>
    </div>
  );
}
