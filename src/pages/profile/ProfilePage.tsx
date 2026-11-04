// src/pages/profile/ProfilePage.tsx
import { useState } from 'react';
import { Field } from '../../components/common/Field';
import { FormSection } from '../../components/common/FormSection';
import { Input, Select, Textarea } from '../../components/ui/Input'; // Textarea 추가
import { Segment } from '../../components/ui/Segment';
import { ChipGroup } from '../../components/ui/Chip';
import {
  CONTACT_TYPES,
  CONTACT_PLACEHOLDER,
  CONTACT_INPUT_TYPE,
  type ContactType,
} from '../../constants/contact';
import {
  PARTS, TECH_STACKS, FIELDS, ROLES, TEAM_TENDENCIES, COLLAB_GROUPS, // COLLAB_GROUPS 추가
} from '../../constants/options';
import type { TechLevel } from '../../constants/levels';
import {
  EMPTY_PROFILE,
  createEmptyExperience,
  type Experience,
  type ProfileForm,
  type CollabPreference,
} from '../../types/profile';
import { ProfileSide, type TocItem } from './ProfileSide';
import { TechLevelList } from './TechLevelList';
import styles from './ProfilePage.module.css';
import { EtcChipGroup } from '../../components/common/EtcChipGroup';
import { ExperienceCard } from './ExperienceCard';

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>(EMPTY_PROFILE);

  /** 폼의 한 항목만 바꾸는 도우미: update('name', '김수뭉') */
  const update = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /* ---------- 기술 스택 ↔ 수준 연결 ---------- */
  const handleStacksChange = (nextStacks: string[]) => {
    setForm((prev) => {
      const nextLevels: Record<string, TechLevel | null> = {};
      // 선택된 기술만 남기고, 새로 고른 기술은 아직 수준 없음(null)
      for (const stack of nextStacks) nextLevels[stack] = prev.levels[stack] ?? null;
      return {
        ...prev,
        stacks: nextStacks,
        levels: nextLevels,
        stackEtc: nextStacks.includes('기타') ? prev.stackEtc : '', // 기타 해제 시 입력값 비우기
      };
    });
  };

  const handleLevelChange = (stack: string, level: TechLevel) =>
    setForm((prev) => ({ ...prev, levels: { ...prev.levels, [stack]: level } }));

  /* ---------- 프로젝트 경험 ---------- */
  const addExperience = () =>
    setForm((prev) => ({ ...prev, experiences: [...prev.experiences, createEmptyExperience()] }));

  const updateExperience = (id: string, patch: Partial<Experience>) =>
    setForm((prev) => ({
      ...prev,
      experiences: prev.experiences.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));

  const removeExperience = (exp: Experience) => {
    // 내용을 적어 둔 카드면 한 번 더 확인
    const hasContent = exp.types.length || exp.fields.length || exp.roles.length || exp.stacks.length || exp.detail;
    if (hasContent && !window.confirm('이 경험을 삭제할까요? 입력한 내용이 사라져요.')) return;
    setForm((prev) => ({ ...prev, experiences: prev.experiences.filter((e) => e.id !== exp.id) }));
  };

  /* ---------- 협업 성향 ---------- */
  const updateCollab = (key: keyof CollabPreference, value: string[]) =>
    setForm((prev) => ({ ...prev, collab: { ...prev.collab, [key]: value } }));

  const collabCount = Object.values(form.collab).reduce((sum, list) => sum + list.length, 0);

  /* ---------- 필수 항목 진행도 ---------- */
  const hasEtcStack = form.stacks.includes('기타');
  const required = {
    name: form.name.trim() !== '',
    major: form.major.trim() !== '',
    contact: form.contactValue.trim() !== '',
    parts: form.parts.length > 0,
    stacks: form.stacks.length > 0 && (!hasEtcStack || form.stackEtc.trim() !== ''),
    levels: form.stacks.length > 0 && form.stacks.every((s) => form.levels[s]),
    fields:
      form.fields.length > 0 && (!form.fields.includes('기타') || form.fieldEtc.trim() !== ''),
    roles:
      form.wantedRoles.length > 0 && (!form.wantedRoles.includes('기타') || form.roleEtc.trim() !== ''),
  };
  const requiredDone = Object.values(required).filter(Boolean).length;
  const requiredTotal = Object.keys(required).length;

  const basicDone = required.name && required.major && required.contact && required.parts;
  const skillDone = required.stacks && required.levels;

  const toc: TocItem[] = [
    { id: 'basic', label: '기본 정보', status: basicDone ? '완료' : '입력 필요', done: basicDone },
    { id: 'skill', label: '역량', status: skillDone ? '완료' : '입력 필요', done: skillDone },
    { id: 'field', label: '관심 분야', status: required.fields ? '완료' : '입력 필요', done: required.fields },
    {
      id: 'experience',
      label: '프로젝트 경험',
      status: form.experiences.length ? `${form.experiences.length}개` : '선택',
      done: false,
    },
    { id: 'role', label: '희망 역할', status: required.roles ? '완료' : '입력 필요', done: required.roles },
    { id: 'collab', label: '협업 성향', status: collabCount ? `${collabCount}개 선택` : '선택', done: false },
    { id: 'intro', label: '소개', status: form.intro.trim() ? '작성함' : '선택', done: false },
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
        <ProfileSide form={form} requiredDone={requiredDone} requiredTotal={requiredTotal} toc={toc} />

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

          {/* ---------- 역량 ---------- */}
          <FormSection
            id="skill"
            title="역량"
            description="사용할 수 있는 기술을 고르면 기술별 활용 수준을 선택하는 칸이 생겨요."
          >
            <Field label="기술 스택" req="필수" hint="복수 선택">
              <ChipGroup
                multiple
                options={TECH_STACKS}
                value={form.stacks}
                onChange={handleStacksChange}
                aria-label="기술 스택"
              />
              {hasEtcStack && (
                <Input
                  className={styles.etcInput}
                  placeholder="기타 기술 이름 (예: Kotlin)"
                  value={form.stackEtc}
                  onChange={(e) => update('stackEtc', e.target.value)}
                  aria-label="기타 기술 이름"
                />
              )}
            </Field>

            <Field
              label="기술 스택별 활용 수준"
              req="조건부 필수"
              hint="선택한 기술마다 하나씩. 설명을 보고 가장 가까운 수준을 골라 주세요"
            >
              <TechLevelList
                stacks={form.stacks}
                stackEtc={form.stackEtc}
                levels={form.levels}
                onChange={handleLevelChange}
              />
            </Field>
          </FormSection>

          {/* ---------- 관심 분야 ---------- */}
          <FormSection id="field" title="관심 분야" description="해보고 싶은 프로젝트 분야를 골라 주세요.">
            <Field label="관심 분야" req="필수" hint="복수 선택">
              <EtcChipGroup
                options={FIELDS}
                value={form.fields}
                onChange={(v) => update('fields', v)}
                etcValue={form.fieldEtc}
                onEtcChange={(v) => update('fieldEtc', v)}
                etcPlaceholder="관심 분야 직접 입력 (예: 블록체인)"
                aria-label="관심 분야"
              />
            </Field>
          </FormSection>

          <FormSection
            id="experience"
            title="프로젝트 경험"
            description="참여했던 프로젝트를 하나씩 추가해 주세요. 입력하지 않아도 괜찮아요."
          >
            {form.experiences.length > 0 && (
              <div className={styles.expList}>
                {form.experiences.map((exp, i) => (
                  <ExperienceCard
                    key={exp.id}
                    index={i}
                    experience={exp}
                    onChange={(patch) => updateExperience(exp.id, patch)}
                    onRemove={() => removeExperience(exp)}
                  />
                ))}
              </div>
            )}
            <button type="button" className={styles.addButton} onClick={addExperience}>
              + 프로젝트 경험 추가
            </button>
          </FormSection>

          {/* ---------- 희망 역할 ---------- */}
          <FormSection id="role" title="희망 역할" description="다음 프로젝트에서 맡고 싶은 역할이에요.">
            <Field label="담당 역할" req="필수" hint="복수 선택">
              <EtcChipGroup
                options={ROLES}
                value={form.wantedRoles}
                onChange={(v) => update('wantedRoles', v)}
                etcValue={form.roleEtc}
                onEtcChange={(v) => update('roleEtc', v)}
                etcPlaceholder="희망 역할 직접 입력 (예: PM, QA)"
                aria-label="희망 역할"
              />
            </Field>
            <Field label="팀 내 성향" hint="하나만 선택">
              <ChipGroup
                options={TEAM_TENDENCIES}
                value={form.teamTendency}
                onChange={(v) => update('teamTendency', v)}
                aria-label="팀 내 성향"
              />
            </Field>
          </FormSection>

          <FormSection
            id="collab"
            title="협업 성향"
            description="비슷한 방식으로 일하는 팀원을 찾는 데 쓰여요. 해당하는 것을 모두 골라 주세요."
          >
            {COLLAB_GROUPS.map((group) => (
              <Field key={group.key} label={group.label}>
                <ChipGroup
                  multiple
                  options={group.options}
                  value={form.collab[group.key]}
                  onChange={(v) => updateCollab(group.key, v)}
                  aria-label={group.label}
                />
              </Field>
            ))}
          </FormSection>

          <FormSection
            id="intro"
            title="소개"
            description="자신의 강점, 경험, 하고 싶은 일 등을 자유롭게 적어 주세요."
          >
            <Field label="소개" htmlFor="intro">
              <Textarea
                id="intro"
                placeholder="예: Spring Boot와 MySQL 기반 REST API 설계에 자신 있어요. 끝까지 완주하는 프로젝트를 해보고 싶어요."
                value={form.intro}
                maxLength={500}
                onChange={(e) => update('intro', e.target.value)}
                style={{ minHeight: 110 }}
              />
              <p className={styles.counter}>{form.intro.length} / 500</p>
            </Field>
          </FormSection>
        </div>
      </div>
    </div>
  );
}