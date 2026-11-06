// src/pages/project-form/ProjectFormPage.tsx
// 프로젝트 모집 등록 · 수정 (Figma 03). 사이드바 "프로젝트 관리" 화면
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { BasicInfoSection } from './BasicInfoSection';
import { CollabSection } from './CollabSection';
import { CurrentTeamSection } from './CurrentTeamSection';
import { PostSection } from './PostSection';
import { RecruitSection } from './RecruitSection';
import { ReferenceSection } from './ReferenceSection';
import { TeamSummary } from './TeamSummary';
import {
  MY_PROJECTS,
  emptyForm,
  requiredItems,
  type ProjectFormValues,
} from './formModel';
import s from './ProjectFormPage.module.css';

const NEW = 'new';

export default function ProjectFormPage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string>(MY_PROJECTS[0]?.id ?? NEW);
  const [form, setForm] = useState<ProjectFormValues>(
    () => MY_PROJECTS[0]?.create() ?? emptyForm(),
  );
  const [showErrors, setShowErrors] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const editing = MY_PROJECTS.find((p) => p.id === selectedId);
  const pageTitle = editing ? `${editing.title} 수정` : '새 프로젝트 등록';

  const update = (patch: Partial<ProjectFormValues>) => setForm((prev) => ({ ...prev, ...patch }));

  const select = (id: string) => {
    setSelectedId(id);
    setForm(MY_PROJECTS.find((p) => p.id === id)?.create() ?? emptyForm());
    setShowErrors(false);
    setNotice(null);
  };

  const handleSave = () => {
    setShowErrors(true);
    if (requiredItems(form).every((it) => it.done)) {
      // TODO: 백엔드 연동 후 저장 API 호출, 저장 뒤 팀원 추천 화면으로 이동
      setNotice({ tone: 'ok', text: '저장했어요. (백엔드 연동 전이라 화면에서만 저장돼요)' });
    } else {
      setNotice({ tone: 'error', text: '추천에 필요한 항목을 먼저 채워 주세요. 빨간 항목을 확인해 주세요.' });
    }
  };

  const sectionProps = { form, update, showErrors };

  return (
    <div>
      <h1 className={`t-h1 ${s.heading}`}>{pageTitle}</h1>
      <p className={s.sub}>
        <em>추천 필수</em> 항목을 채우면 팀원 추천을 받을 수 있어요. 직접 검색만 할 거라면 비워 둬도 괜찮아요.
      </p>

      <div className={s.projects}>
        <span className={s.projectsLabel}>내 프로젝트</span>
        <Chip selected={selectedId === NEW} selectedStyle="filled" onClick={() => select(NEW)}>
          <Plus size={14} aria-hidden="true" /> 새 프로젝트
        </Chip>
        {MY_PROJECTS.map((p) => (
          <Chip
            key={p.id}
            selected={selectedId === p.id}
            selectedStyle="filled"
            onClick={() => select(p.id)}
          >
            {p.label}
          </Chip>
        ))}
      </div>

      <div className={s.layout}>
        <form className={s.card} onSubmit={(e) => e.preventDefault()} noValidate>
          <BasicInfoSection {...sectionProps} />
          <RecruitSection {...sectionProps} />
          <CollabSection {...sectionProps} />
          <CurrentTeamSection {...sectionProps} />
          <ReferenceSection {...sectionProps} />
          <PostSection {...sectionProps} />

          {notice && (
            <p className={notice.tone === 'ok' ? s.noticeOk : s.noticeError} role="status">
              {notice.text}
            </p>
          )}
          <div className={s.footer}>
            {/* TODO: 사람 검색 화면 경로가 정해지면 연결 */}
            <Button variant="ghost" onClick={() => navigate('/search')}>
              조건 없이 사람 검색하기
            </Button>
            <Button onClick={handleSave}>
              {editing ? '저장하고 팀원 추천받기' : '등록하고 팀원 추천받기'}
            </Button>
          </div>
        </form>

        <TeamSummary form={form} />
      </div>
    </div>
  );
}
