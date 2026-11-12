// src/pages/profile/ProfilePage.tsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Field } from '../../components/common/Field';
import { FormSection } from '../../components/common/FormSection';
import { EtcChipGroup } from '../../components/common/EtcChipGroup';
import { useToast } from '../../components/common/Toast';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Segment } from '../../components/ui/Segment';
import { ChipGroup } from '../../components/ui/Chip';
import { ApiError, ERROR_CODE, profilesApi } from '../../api';
import { fromProfileDetail, toProfileRequest } from '../../api/mappers/profile';
import { useAuth } from '../../stores/auth';
import {
  CONTACT_TYPES,
  CONTACT_PLACEHOLDER,
  CONTACT_INPUT_TYPE,
  type ContactType,
} from '../../constants/contact';
import {
  PARTS,
  TECH_STACKS,
  FIELDS,
  ROLES,
  TEAM_TENDENCIES,
  COLLAB_GROUPS,
  withExtraOptions,
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
import { ExperienceCard } from './ExperienceCard';
import { validateProfile, REQUIRED_KEYS, SECTION_OF, type RequiredKey } from './validateProfile';
import styles from './ProfilePage.module.css';

type LoadState = 'loading' | 'ready' | 'error';

export default function ProfilePage() {
  const toast = useToast();
  const { status, account, setProfileId } = useAuth();
  const profileId = account?.profileId ?? null;

  const [form, setForm] = useState<ProfileForm>(EMPTY_PROFILE);
  /** 마지막으로 저장(또는 불러온) 상태 — 취소할 때 여기로 되돌림 */
  const [savedForm, setSavedForm] = useState<ProfileForm>(EMPTY_PROFILE);
  const [showErrors, setShowErrors] = useState(false);
  const [notice, setNotice] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);

  /* ---------- 불러오기 ---------- */
  useEffect(() => {
    if (status !== 'authenticated') return;

    // 아직 프로필이 없으면 빈 폼으로 시작
    if (!profileId) {
      setLoadState('ready');
      return;
    }

    let cancelled = false; // 화면을 떠난 뒤 도착한 응답은 무시
    setLoadState('loading');
    profilesApi
      .get(profileId)
      .then((res) => {
        if (cancelled) return;
        const loaded = fromProfileDetail(res);
        setForm(loaded);
        setSavedForm(loaded);
        setLoadState('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.code === ERROR_CODE.PROFILE_NOT_FOUND) {
          setLoadState('ready'); // 서버에 없으면 새로 만들기
        } else {
          setLoadState('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [status, profileId, reloadKey]);

  /** 폼의 한 항목만 바꾸는 도우미 */
  const update = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /* ---------- 기술 스택 ↔ 수준 연결 ---------- */
  const handleStacksChange = (nextStacks: string[]) => {
    setForm((prev) => {
      const nextLevels: Record<string, TechLevel | null> = {};
      for (const stack of nextStacks) nextLevels[stack] = prev.levels[stack] ?? null;
      return {
        ...prev,
        stacks: nextStacks,
        levels: nextLevels,
        stackEtc: nextStacks.includes('기타') ? prev.stackEtc : '',
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
    const hasContent =
      exp.types.length || exp.fields.length || exp.roles.length || exp.stacks.length || exp.detail;
    if (hasContent && !window.confirm('이 경험을 삭제할까요? 입력한 내용이 사라져요.')) return;
    setForm((prev) => ({ ...prev, experiences: prev.experiences.filter((e) => e.id !== exp.id) }));
  };

  /* ---------- 협업 성향 ---------- */
  const updateCollab = (key: keyof CollabPreference, value: string[]) =>
    setForm((prev) => ({ ...prev, collab: { ...prev.collab, [key]: value } }));

  const collabCount = Object.values(form.collab).reduce((sum, list) => sum + list.length, 0);

  /* ---------- 필수 항목 검사 ---------- */
  const hasEtcStack = form.stacks.includes('기타');
  const errors = validateProfile(form);
  const isDone = (key: RequiredKey) => !errors[key];
  const requiredDone = REQUIRED_KEYS.filter(isDone).length;
  const requiredTotal = REQUIRED_KEYS.length;
  const err = (key: RequiredKey) => (showErrors ? errors[key] : undefined);

  const basicDone = isDone('name') && isDone('major') && isDone('contact') && isDone('parts');
  const skillDone = isDone('stacks') && isDone('levels');

  const toc: TocItem[] = [
    { id: 'basic', label: '기본 정보', status: basicDone ? '완료' : '입력 필요', done: basicDone },
    { id: 'skill', label: '역량', status: skillDone ? '완료' : '입력 필요', done: skillDone },
    { id: 'field', label: '관심 분야', status: isDone('fields') ? '완료' : '입력 필요', done: isDone('fields') },
    {
      id: 'experience',
      label: '프로젝트 경험',
      status: form.experiences.length ? `${form.experiences.length}개` : '선택',
      done: false,
    },
    { id: 'role', label: '희망 역할', status: isDone('roles') ? '완료' : '입력 필요', done: isDone('roles') },
    { id: 'collab', label: '협업 성향', status: collabCount ? `${collabCount}개 선택` : '선택', done: false },
    { id: 'intro', label: '소개', status: form.intro.trim() ? '작성함' : '선택', done: false },
  ];

  /* ---------- 저장 · 취소 ---------- */
  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);

  const handleSave = async () => {
    setShowErrors(true);
    const errorKeys = REQUIRED_KEYS.filter((k) => errors[k]);

    if (errorKeys.length > 0) {
      setNotice({ type: 'error', text: `필수 항목 ${errorKeys.length}개를 채워 주세요.` });
      document.getElementById(SECTION_OF[errorKeys[0]])?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setSaving(true);
    setNotice(null);
    try {
      const body = toProfileRequest(form);
      if (profileId) {
        await profilesApi.update(profileId, body);
        toast('프로필을 저장했어요', 'success');
      } else {
        const res = await profilesApi.create(body);
        setProfileId(res.profileId); // 로그인 상태에 "프로필 있음" 반영
        toast('프로필을 만들었어요! 이제 팀원 추천을 받을 수 있어요', 'success');
      }
      setSavedForm(form);
      setShowErrors(false);
    } catch (e) {
      const code = e instanceof ApiError ? e.code : '';
      if (code === ERROR_CODE.VALIDATION_ERROR) {
        setNotice({ type: 'error', text: '입력한 내용을 다시 확인해 주세요.' });
      } else if (code === ERROR_CODE.NETWORK_ERROR) {
        setNotice({ type: 'error', text: '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.' });
      } else if (code === ERROR_CODE.UNAUTHENTICATED) {
        setNotice({ type: 'error', text: '로그인이 풀렸어요. 다시 로그인해 주세요.' });
      } else {
        setNotice({ type: 'error', text: '저장하지 못했어요. 잠시 후 다시 시도해 주세요.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!isDirty) return;
    if (!window.confirm('저장하지 않은 변경 사항이 사라져요. 되돌릴까요?')) return;
    setForm(savedForm);
    setShowErrors(false);
    setNotice(null);
  };

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  /* ---------- 화면 상태별 처리 (훅들보다 아래에 있어야 해요) ---------- */
  // TODO(5단계): 로그인 확인은 라우팅에서 한 번에 처리
  if (status === 'unauthenticated') return <Navigate to="/login" replace state={{ from: '/profile' }} />;

  if (status === 'loading' || loadState === 'loading') {
    return <div className={styles.state}>프로필을 불러오는 중이에요…</div>;
  }

  if (loadState === 'error') {
    return (
      <div className={styles.state}>
        <p>프로필을 불러오지 못했어요.</p>
        <Button variant="ghost" onClick={() => setReloadKey((k) => k + 1)}>
          다시 시도
        </Button>
      </div>
    );
  }

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
              <Field label="이름" req="필수" htmlFor="name" error={err('name')}>
                <Input
                  id="name"
                  invalid={!!err('name')}
                  placeholder="예: 김수뭉"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                />
              </Field>
              <Field label="전공" req="필수" htmlFor="major" error={err('major')}>
                <Input
                  id="major"
                  invalid={!!err('major')}
                  placeholder="예: 컴퓨터과학과"
                  value={form.major}
                  onChange={(e) => update('major', e.target.value)}
                />
              </Field>
            </div>

            <Field label="연락처" req="필수" hint="지원·제안이 수락된 상대에게만 공개돼요" error={err('contact')}>
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
                  invalid={!!err('contact')}
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

            <Field label="소속 파트" req="필수" hint="복수 선택" error={err('parts')}>
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
            <Field label="기술 스택" req="필수" hint="복수 선택" error={err('stacks')}>
              <ChipGroup
                multiple
                options={withExtraOptions(TECH_STACKS, form.stacks)}
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
              error={err('levels')}
            >
              <TechLevelList
                stacks={form.stacks}
                stackEtc={form.stackEtc}
                levels={form.levels}
                onChange={handleLevelChange}
                showErrors={showErrors}
              />
            </Field>
          </FormSection>

          {/* ---------- 관심 분야 ---------- */}
          <FormSection id="field" title="관심 분야" description="해보고 싶은 프로젝트 분야를 골라 주세요.">
            <Field label="관심 분야" req="필수" hint="복수 선택" error={err('fields')}>
              <EtcChipGroup
                options={withExtraOptions(FIELDS, form.fields)}
                value={form.fields}
                onChange={(v) => update('fields', v)}
                etcValue={form.fieldEtc}
                onEtcChange={(v) => update('fieldEtc', v)}
                etcPlaceholder="관심 분야 직접 입력 (예: 블록체인)"
                aria-label="관심 분야"
              />
            </Field>
          </FormSection>

          {/* ---------- 프로젝트 경험 ---------- */}
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
            <Field label="담당 역할" req="필수" hint="복수 선택" error={err('roles')}>
              <EtcChipGroup
                options={withExtraOptions(ROLES, form.wantedRoles)}
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

          {/* ---------- 협업 성향 ---------- */}
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

          {/* ---------- 소개 ---------- */}
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

          {/* ---------- 저장 바 ---------- */}
          <div className={styles.saveBar}>
            {notice && (
              <p role="status" className={notice.type === 'ok' ? styles.noticeOk : styles.noticeError}>
                {notice.text}
              </p>
            )}
            <Button variant="ghost" onClick={handleCancel} disabled={!isDirty || saving}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? '저장하는 중…' : profileId ? '프로필 저장' : '프로필 만들기'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}