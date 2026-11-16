// src/pages/projects/ApplyModal.tsx
import { useState } from 'react';
import { Field } from '../../components/common/Field';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/ui/Button';
import { ChipGroup } from '../../components/ui/Chip';
import type { RecruitProject } from '../../types/project';

export interface ApplyPayload {
  projectId: string;
  /** 지원할 역할 (예: "Frontend") */
  role: string;
}

interface ApplyModalProps {
  /** 지원할 프로젝트 (null이면 닫힘) */
  project: RecruitProject | null;
  onClose: () => void;
  onSubmit: (payload: ApplyPayload) => void;
}

/** 지원하기 모달 (Figma M2): 역할을 고르고 등록자에게 남길 메시지를 써요 */
export function ApplyModal({ project, onClose, onSubmit }: ApplyModalProps) {
  return (
    <Modal
      open={project !== null}
      onClose={onClose}
      title={project ? `${project.title}에 지원` : ''}
      description={
        project
          ? `지원할 역할을 골라 주세요. 등록자(${project.author} 님)가 수락하면 그 역할로 팀에 합류해요.`
          : undefined
      }
    >
      {/* 열릴 때마다 입력값이 초기화되도록 프로젝트별로 새로 그림 */}
      {project && <ApplyForm key={project.id} project={project} onClose={onClose} onSubmit={onSubmit} />}
    </Modal>
  );
}

function ApplyForm({ project, onClose, onSubmit }: Omit<ApplyModalProps, 'project'> & { project: RecruitProject }) {
  const roleLabel = (r: { role: string; count: number }) => `${r.role} ${r.count}명 모집`;
  const [roleText, setRoleText] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const selected = project.roles.find((r) => roleLabel(r) === roleText);

  const handleSubmit = () => {
    if (!selected) {
      setShowError(true);
      return;
    }
    onSubmit({ projectId: project.id, role: selected.role });
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Field label="역할" req="필수" error={showError && !selected ? '지원할 역할을 골라 주세요.' : undefined}>
        <ChipGroup
          options={project.roles.map(roleLabel)}
          value={roleText}
          onChange={setRoleText}
          aria-label="지원할 역할"
        />
      </Field>

      {/* TODO: 서버가 메시지를 받게 되면 메시지 입력칸 다시 추가 */}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingBottom: 10 }}>
        <Button variant="ghost" onClick={onClose}>
          취소
        </Button>
        <Button onClick={handleSubmit}>보내기</Button>
      </div>
    </div>
  );
}
