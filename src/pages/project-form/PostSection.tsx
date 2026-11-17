// src/pages/project-form/PostSection.tsx
import { useState } from 'react';
import { ApiError, ERROR_CODE, recruitPostApi } from '../../api';
import { toRecruitPostDraftRequest } from '../../api/mappers/project';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { FieldLabel } from './FormParts';
import type { SectionProps } from './formModel';
import s from './FormSections.module.css';

function draftErrorText(e: unknown) {
  if (e instanceof ApiError && e.code === ERROR_CODE.NETWORK_ERROR) {
    return '서버에 연결하지 못했어요. 인터넷 연결을 확인해 주세요.';
  }
  return 'AI가 모집글을 만들지 못했어요. 잠시 후 다시 시도해 주세요.';
}

export function PostSection({ form, update }: SectionProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!form.name.trim()) {
      setError('프로젝트명을 먼저 적어 주세요.');
      return;
    }
    // 고친 초안을 덮어쓰기 전에 한 번 확인
    if (form.draft?.trim() && !window.confirm('지금 초안을 지우고 새로 만들까요? 직접 고친 내용도 사라져요.')) return;

    setGenerating(true);
    setError(null);
    try {
      const { post } = await recruitPostApi.draft(toRecruitPostDraftRequest(form));
      update({ draft: post });
    } catch (e) {
      setError(draftErrorText(e));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section className={s.section}>
      <h2 className={s.title}>모집글 정보</h2>
      <p className={s.desc}>
        모집글 초안에 들어갈 내용이에요. 모두 선택 항목이라 비워 둬도 등록과 팀원 추천은 그대로 돼요.
      </p>

      <div className={s.field}>
        <FieldLabel htmlFor="pf-bg" hint="선택 · 시작하게 된 계기, 해결하고 싶은 문제">프로젝트 추진 배경</FieldLabel>
        <Textarea
          id="pf-bg"
          placeholder="예: 영단어 앱을 써 봐도 틀린 단어를 계속 틀리는 문제가 해결되지 않았어요."
          value={form.background}
          onChange={(e) => update({ background: e.target.value })}
        />
      </div>

      <div className={s.field}>
        <FieldLabel htmlFor="pf-goal" hint="선택 · 위의 '프로젝트 목적'과 별개로, 만들거나 달성하고 싶은 결과">구체적인 목표</FieldLabel>
        <Textarea
          id="pf-goal"
          placeholder="예: 오답 분석부터 단어장 생성까지 실제로 동작하는 웹 서비스를 해커톤 기간 안에 완성하고 싶어요."
          value={form.goal}
          onChange={(e) => update({ goal: e.target.value })}
        />
      </div>

      <div className={s.field}>
        <FieldLabel htmlFor="pf-team" hint="선택 · 기술 조건 말고 기대하는 태도, 경험, 참여 방식">함께하고 싶은 팀원</FieldLabel>
        <Textarea
          id="pf-team"
          placeholder="예: 막히는 부분이 있으면 바로 공유하고, 마감 직전까지 같이 버그를 잡아줄 분이면 좋겠어요."
          value={form.wantedTeam}
          onChange={(e) => update({ wantedTeam: e.target.value })}
        />
      </div>

      <Button variant="ai" block onClick={generate} disabled={generating} aria-busy={generating}>
        {generating
          ? 'AI가 모집글을 쓰고 있어요…'
          : form.draft === null
            ? 'AI로 모집글 초안 만들기'
            : 'AI로 모집글 초안 다시 만들기'}
      </Button>
      {error ? (
        <p className={s.aiError} role="alert">
          {error}
        </p>
      ) : (
        <p className={s.aiNote}>
          {generating
            ? '입력한 내용을 정리하느라 몇 초 걸릴 수 있어요.'
            : '위에 입력한 내용만으로 AI가 초안을 써요. 입력에 없는 경험·일정·혜택은 지어내지 않아요.'}
        </p>
      )}

      {form.draft !== null && (
        <div className={s.draft}>
          <div className={s.draftHead}>
            <strong>모집글 초안</strong>
            <span className={s.draftBadge}>AI 작성</span>
          </div>
          <p className={s.draftSub}>
            자유롭게 수정할 수 있어요. 저장하면 프로젝트 카드의 '모집글 보기'에 올라가요.
          </p>
          <Textarea
            className={s.draftText}
            aria-label="모집글 초안"
            value={form.draft}
            onChange={(e) => update({ draft: e.target.value })}
          />
        </div>
      )}
    </section>
  );
}
