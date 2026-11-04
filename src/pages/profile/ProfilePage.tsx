// src/pages/profile/ProfilePage.tsx
import { useState } from 'react';
import { Field } from '../../components/common/Field';
import { FormSection } from '../../components/common/FormSection';
import { Input, Select } from '../../components/ui/Input';
import { Segment } from '../../components/ui/Segment';
import { ChipGroup } from '../../components/ui/Chip';
import {
  CONTACT_TYPES,
  CONTACT_PLACEHOLDER,
  CONTACT_INPUT_TYPE,
  type ContactType,
} from '../../constants/contact';
import { PARTS } from '../../constants/options';
import { EMPTY_PROFILE, type ProfileForm } from '../../types/profile';
import { ProfileSide, type TocItem } from './ProfileSide';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>(EMPTY_PROFILE);

  /** 폼의 한 항목만 바꾸는 도우미: update('name', '김수뭉') */
  const update = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // 4단계에서 자동 계산으로 바꿀 예정 — 지금은 기본 정보만 계산
  const basicDone = !!(form.name && form.major && form.contactValue && form.parts.length);
  const toc: TocItem[] = [
    { id: 'basic', label: '기본 정보', status: basicDone ? '완료' : '입력 필요', done: basicDone },
    { id: 'skill', label: '역량', status: '입력 필요', done: false },
    { id: 'field', label: '관심 분야', status: '입력 필요', done: false },
    { id: 'experience', label: '프로젝트 경험', status: '선택', done: false },
    { id: 'role', label: '희망 역할', status: '입력 필요', done: false },
    { id: 'collab', label: '협업 성향', status: '선택', done: false },
    { id: 'intro', label: '소개', status: '선택', done: false },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className="t-h1">내 프로필</h1>
        <p>
          입력한 역량과 성향은 팀원 추천에 사용돼요. <strong>필수</strong> 항목만 채워도 추천을 받을 수
          있어요.
        </p>
      </div>

      <div className={styles.layout}>
        <ProfileSide form={form} requiredDone={basicDone ? 1 : 0} requiredTotal={8} toc={toc} />

        <div className={styles.card}>
          {/* ---------- 기본 정보 ---------- */}
          <FormSection id="basic" title="기본 정보" description="다른 동아리원에게 보여질 기본 정보예요.">
            <div className={styles.grid2}>
              <Field label="이름" req="필수" htmlFor="name">
                <Input
                  id="name"
                  placeholder="예: 김수뭉"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                />
              </Field>
              <Field label="전공" req="필수" htmlFor="major">
                <Input
                  id="major"
                  placeholder="예: 컴퓨터과학과"
                  value={form.major}
                  onChange={(e) => update('major', e.target.value)}
                />
              </Field>
            </div>

            <Field label="연락처" req="필수" hint="지원·제안이 수락된 상대에게만 공개돼요">
              <div className={styles.contactRow}>
                <Select
                  options={CONTACT_TYPES}
                  value={form.contactType}
                  onChange={(e) => {
                    update('contactType', e.target.value as ContactType);
                    update('contactValue', '');
                  }}
                  style={{ width: 170, flexShrink: 0 }}
                />
                <Input
                  type={CONTACT_INPUT_TYPE[form.contactType]}
                  placeholder={CONTACT_PLACEHOLDER[form.contactType]}
                  value={form.contactValue}
                  onChange={(e) => update('contactValue', e.target.value)}
                />
              </div>
            </Field>

            <Field
              label="프로필 공개 설정"
              help={
                form.isPublic
                  ? '팀원 검색·추천 결과에 내 프로필이 보여요.'
                  : '검색·추천에 보이지 않아요. 내가 지원·제안할 때만 상대가 볼 수 있어요.'
              }
            >
              <div>
                <Segment
                  options={['공개', '비공개']}
                  value={form.isPublic ? '공개' : '비공개'}
                  onChange={(v) => update('isPublic', v === '공개')}
                  aria-label="프로필 공개 설정"
                />
              </div>
            </Field>

            <Field label="소속 파트" req="필수" hint="복수 선택">
              <ChipGroup
                multiple
                options={PARTS}
                value={form.parts}
                onChange={(v) => update('parts', v)}
                aria-label="소속 파트"
              />
            </Field>
          </FormSection>

          {/* 2~3단계에서 채울 섹션들 */}
          <FormSection id="skill" title="역량" description="사용할 수 있는 기술을 고르면 기술별 활용 수준을 선택하는 칸이 생겨요.">
            <p className="t-body-s">2단계에서 만들어요.</p>
          </FormSection>
          <FormSection id="field" title="관심 분야" description="해보고 싶은 프로젝트 분야를 골라 주세요.">
            <p className="t-body-s">2단계에서 만들어요.</p>
          </FormSection>
          <FormSection id="experience" title="프로젝트 경험" description="참여했던 프로젝트를 하나씩 추가해 주세요. 입력하지 않아도 괜찮아요.">
            <p className="t-body-s">3단계에서 만들어요.</p>
          </FormSection>
          <FormSection id="role" title="희망 역할" description="다음 프로젝트에서 맡고 싶은 역할이에요.">
            <p className="t-body-s">2단계에서 만들어요.</p>
          </FormSection>
          <FormSection id="collab" title="협업 성향" description="비슷한 방식으로 일하는 팀원을 찾는 데 쓰여요.">
            <p className="t-body-s">3단계에서 만들어요.</p>
          </FormSection>
          <FormSection id="intro" title="소개" description="자신의 강점, 경험, 하고 싶은 일 등을 자유롭게 적어 주세요.">
            <p className="t-body-s">3단계에서 만들어요.</p>
          </FormSection>
        </div>
      </div>
    </div>
  );
}