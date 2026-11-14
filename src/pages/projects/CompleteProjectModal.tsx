// src/pages/projects/CompleteProjectModal.tsx
import { useState } from 'react';
import { Field } from '../../components/common/Field';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import type { OutputLink } from '../../types/project';
import styles from './CompleteProjectModal.module.css';

/** 산출물 입력칸. GitHub만 필수예요 */
const OUTPUT_FIELDS = [
  { label: 'GitHub', placeholder: 'https://github.com/', required: true },
  { label: '배포 URL', placeholder: 'https://', required: false },
  { label: '발표자료', placeholder: 'https://', required: false },
] as const;

const URL_MESSAGE = 'https://로 시작하는 주소를 입력해 주세요.';

const isUrl = (value: string) => /^https?:\/\/\S+$/i.test(value);

interface CompleteProjectModalProps {
  open: boolean;
  projectTitle: string;
  onClose: () => void;
  /** 입력한 산출물(GitHub는 항상 포함)과 함께 완료 처리 */
  onConfirm: (outputs: OutputLink[]) => void;
}

export function CompleteProjectModal({ open, ...rest }: CompleteProjectModalProps) {
  // 열 때마다 입력칸이 비어 있도록, 닫혀 있을 때는 폼 자체를 그리지 않아요
  return open ? <CompleteForm {...rest} /> : null;
}

function CompleteForm({ projectTitle, onClose, onConfirm }: Omit<CompleteProjectModalProps, 'open'>) {
  const [values, setValues] = useState<string[]>(OUTPUT_FIELDS.map(() => ''));
  // 필수 칸은 한 번 건드렸다가 비워 두면 안내 문구를 보여줘요
  const [touched, setTouched] = useState<boolean[]>(OUTPUT_FIELDS.map(() => false));

  const trimmed = values.map((v) => v.trim());
  const errors = OUTPUT_FIELDS.map((f, i) => {
    if (!trimmed[i]) return f.required && touched[i] ? 'GitHub 주소는 꼭 입력해 주세요.' : undefined;
    return isUrl(trimmed[i]) ? undefined : URL_MESSAGE;
  });
  // 필수 칸은 비어 있어도, 입력했는데 형식이 틀려도 완료할 수 없어요
  const canSubmit = OUTPUT_FIELDS.every((f, i) => (trimmed[i] ? isUrl(trimmed[i]) : !f.required));

  const handleConfirm = () => {
    if (!canSubmit) return;
    const outputs = OUTPUT_FIELDS.flatMap((f, i) => (trimmed[i] ? [{ label: f.label, url: trimmed[i] }] : []));
    onConfirm(outputs);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`'${projectTitle}'을(를) 완료 처리할까요?`}
      description="완료하면 완료 · 아카이브 탭으로 이동하고, 단계와 세부 과제는 읽기 전용이 돼요. GitHub 주소는 꼭 제출해 주세요."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={!canSubmit}>
            완료 처리
          </Button>
        </>
      }
    >
      <div className={styles.fields}>
        {OUTPUT_FIELDS.map((f, i) => (
          <Field
            key={f.label}
            label={f.label}
            req={f.required ? '필수' : undefined}
            hint={f.required ? undefined : '선택'}
            htmlFor={`output-${i}`}
            error={errors[i]}
          >
            <Input
              id={`output-${i}`}
              value={values[i]}
              placeholder={f.placeholder}
              invalid={Boolean(errors[i])}
              onChange={(e) => setValues((prev) => prev.map((v, j) => (j === i ? e.target.value : v)))}
              onBlur={() => setTouched((prev) => prev.map((t, j) => (j === i ? true : t)))}
            />
          </Field>
        ))}
      </div>
    </Modal>
  );
}
