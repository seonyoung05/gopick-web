// src/components/common/OfferModal/OfferModal.tsx
import { useState } from 'react';
import { Modal } from '../Modal';
import { Field } from '../Field';
import { Button } from '../../ui/Button';
import { ChipGroup } from '../../ui/Chip';
import type { PersonSummary } from '../../../types/person';
import type { MyRecruitingProject } from '../../../types/participation';

export interface OfferPayload {
  personId: string;
  projectId: string;
  /** 제안할 역할 (서버 역할 값, 예: BACKEND) */
  recruitmentId: string;
}

interface OfferModalProps {
  person: PersonSummary | null;
  projects: MyRecruitingProject[];
  onClose: () => void;
  onSubmit: (payload: OfferPayload) => void;
  /** 미리 골라 둘 모집 역할 (추천 화면에서 탭 역할) */
  defaultRecruitmentId?: string;
  /** 미리 골라 둘 프로젝트 ("팀원 초대하기"로 들어왔을 때) */
  defaultProjectId?: string;
  /** 내 프로젝트 불러오기 상태 (없으면 'done'으로 봄) */
  status?: 'loading' | 'error' | 'done';
}

export function OfferModal({
  person,
  projects,
  onClose,
  onSubmit,
  defaultRecruitmentId,
  defaultProjectId,
  status = 'done',
}: OfferModalProps) {
  return (
    <Modal
      open={person !== null}
      onClose={onClose}
      title={person ? `${person.name} 님에게 참여 제안` : ''}
      description="맡길 역할을 골라 주세요. 상대가 수락하면 그 역할로 팀에 합류해요."
    >
      {/* 열릴 때마다 입력값이 초기화되도록 사람별로 새로 그림 */}
      {person && (
        <OfferForm
          key={person.id}
          person={person}
          projects={projects}
          onClose={onClose}
          onSubmit={onSubmit}
          defaultRecruitmentId={defaultRecruitmentId}
          defaultProjectId={defaultProjectId}
          status={status}
        />
      )}
    </Modal>
  );
}

function OfferForm({
  person,
  projects,
  onClose,
  onSubmit,
  defaultRecruitmentId,
  defaultProjectId,
  status,
}: Omit<OfferModalProps, 'person'> & { person: PersonSummary }) {
  const [projectId, setProjectId] = useState(
    projects.find((p) => p.id === defaultProjectId)?.id ?? projects[0]?.id ?? '',
  );
  const project = projects.find((p) => p.id === projectId);

  // 모집 중인 역할은 "N명 모집"을, 모집 정보가 없는 역할은 이름만
  const roleLabel = (r: { role: string; remaining: number }) =>
    r.remaining > 0 ? `${r.role} ${r.remaining}명 모집` : r.role;
  const defaultRole = project?.recruitments.find((r) => r.recruitmentId === defaultRecruitmentId);
  const [roleText, setRoleText] = useState<string | null>(defaultRole ? roleLabel(defaultRole) : null);
  const [showError, setShowError] = useState(false);

  // 모집 중인 내 프로젝트가 없으면 안내만
  if (projects.length === 0) {
    const text =
      status === 'loading'
        ? '내 프로젝트를 불러오는 중이에요…'
        : status === 'error'
          ? '내 프로젝트를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'
          : '제안할 수 있는 내 프로젝트가 없어요. 내가 팀장인 준비 중·진행 중 프로젝트가 있어야 제안할 수 있어요.';
    return (
      <>
        <p>{text}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <Button variant="ghost" onClick={onClose}>닫기</Button>
        </div>
      </>
    );
  }

  const selected = project?.recruitments.find((r) => roleLabel(r) === roleText);

  const handleSubmit = () => {
    if (!project || !selected) {
      setShowError(true);
      return;
    }
    onSubmit({
      personId: person.id,
      projectId: project.id,
      recruitmentId: selected.recruitmentId,
    });
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* 모집 중인 프로젝트가 여러 개일 때만 프로젝트 선택 */}
      {projects.length > 1 && (
        <Field label="프로젝트">
          <ChipGroup
            options={projects.map((p) => p.name)}
            value={project?.name ?? null}
            onChange={(name) => {
              setProjectId(projects.find((p) => p.name === name)?.id ?? '');
              setRoleText(null);
            }}
            aria-label="제안할 프로젝트"
          />
        </Field>
      )}

      <Field label="역할" req="필수" error={showError && !selected ? '맡길 역할을 골라 주세요.' : undefined}>
        <ChipGroup
          options={project?.recruitments.map(roleLabel) ?? []}
          value={roleText}
          onChange={setRoleText}
          aria-label="제안할 역할"
        />
      </Field>

      {/* TODO: 서버가 메시지를 받게 되면 메시지 입력칸 다시 추가 */}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingBottom: 10 }}>
        <Button variant="ghost" onClick={onClose}>취소</Button>
        <Button onClick={handleSubmit}>보내기</Button>
      </div>
    </div>
  );
}