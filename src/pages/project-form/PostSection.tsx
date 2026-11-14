// src/pages/project-form/PostSection.tsx
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import { FieldLabel } from './FormParts';
import { buildDraft, buildPrompt, type SectionProps } from './formModel';
import s from './FormSections.module.css';

export function PostSection({ form, update }: SectionProps) {
  const [showPrompt, setShowPrompt] = useState(false);

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

      <Button variant="ai" block onClick={() => update({ draft: buildDraft(form) })}>
        {form.draft === null ? '모집글 초안 만들기' : '모집글 초안 다시 만들기'}
      </Button>
      <p className={s.aiNote}>생성형 AI 연동 전이라, 지금은 입력한 내용을 정해진 구조로 정리한 예시 초안을 보여줘요.</p>

      {form.draft !== null && (
        <div className={s.draft}>
          <div className={s.draftHead}>
            <strong>모집글 초안</strong>
            <span className={s.draftBadge}>예시 · AI 연동 전</span>
          </div>
          <p className={s.draftSub}>
            자유롭게 수정할 수 있어요. 등록하면 프로젝트 카드의 '모집글 보기'에 들어가요.
          </p>
          <Textarea
            className={s.draftText}
            aria-label="모집글 초안"
            value={form.draft}
            onChange={(e) => update({ draft: e.target.value })}
          />
          <button
            type="button"
            className={s.promptToggle}
            aria-expanded={showPrompt}
            onClick={() => setShowPrompt((v) => !v)}
          >
            {showPrompt ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            AI에 보낼 프롬프트 보기 (연동 시 사용)
          </button>
          {showPrompt && <pre className={s.prompt}>{buildPrompt(form)}</pre>}
        </div>
      )}
    </section>
  );
}
