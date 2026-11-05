// src/components/common/OfferModal/OfferModal.tsx
import { useState } from 'react';
import { Modal } from '../Modal';
import { Field } from '../Field';
import { Button } from '../../ui/Button';
import { ChipGroup } from '../../ui/Chip';
import { Textarea } from '../../ui/Input';
import type { PersonSummary } from '../../../types/person';
import type { MyRecruitingProject } from '../../../mocks/myProjects';

export interface OfferPayload {
  personId: string;
  projectId: string;
  recruitmentId: string;
  message: string;
}

interface OfferModalProps {
  person: PersonSummary | null;
  projects: MyRecruitingProject[];
  onClose: () => void;
  onSubmit: (payload: OfferPayload) => void;
}

export function OfferModal({ person, projects, onClose, onSubmit }: OfferModalProps) {
  return (
    <Modal
      open={person !== null}
      onClose={onClose}
      title={person ? `${person.name} 님에게 참여 제안` : ''}
      description="맡길 역할을 고르고 메시지를 남겨 주세요. 수락되면 서로의 연락처가 공개돼요."
    >
      {/* 열릴 때마다 입력값이 초기화되도록 사람별로 새로 그림 */}
      {person && (
        <OfferForm key={person.id} person={person} projects={projects} onClose={onClose} onSubmit={onSubmit} />
      )}
    </Modal>
  );
}

function OfferForm({
  person,
  projects,
  onClose,
  onSubmit,
}: Omit<OfferModalProps, 'person'> & { person: PersonSummary }) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '');
  const project = projects.find((p) => p.id === projectId);

  const roleLabel = (r: { role: string; remaining: number }) => `${r.role} ${r.remaining}명 모집`;
  const [roleText, setRoleText] = useState<string | null>(null);
  const [message, setMessage] = useState(
    `안녕하세요, ${person.name} 님! 프로필을 보고 ${projects[0]?.name ?? ''} 팀에 함께하고 싶어서 제안드려요.`,
  );
  const [showError, setShowError] = useState(false);

  // 모집 중인 내 프로젝트가 없으면 안내만
  if (projects.length === 0) {
    return (
      <>
        <p>지금 모집 중인 내 프로젝트가 없어요. 프로젝트를 먼저 등록해 주세요.</p>
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
      message: message.trim(),
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

      <Field label="메시지" hint="선택">
        <Textarea value={message} maxLength={300} onChange={(e) => setMessage(e.target.value)} />
      </Field>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingBottom: 10 }}>
        <Button variant="ghost" onClick={onClose}>취소</Button>
        <Button onClick={handleSubmit}>보내기</Button>
      </div>
    </div>
  );
}