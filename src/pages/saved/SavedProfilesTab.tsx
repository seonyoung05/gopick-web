// src/pages/saved/SavedProfilesTab.tsx
import { useMemo, useState } from 'react';
import { PersonCard, RelationAction } from '../../components/common/PersonCard';
import { ProfileDetailModal } from '../../components/common/ProfileDetailModal';
import { OfferModal, type OfferPayload } from '../../components/common/OfferModal';
import { useToast } from '../../components/common/Toast';
import { Button } from '../../components/ui/Button';
import { MOCK_PEOPLE } from '../../mocks/people';
import { MOCK_SAVED_PROFILES } from '../../mocks/saved';
import { MY_RECRUITING_PROJECTS } from '../../mocks/myProjects';
import type { PersonSummary } from '../../types/person';
import { skillSummary } from '../people/filterPeople';
import styles from './SavedPage.module.css';

export function SavedProfilesTab() {
  const toast = useToast();

  // TODO: API 연결 시 bookmarksApi.getSavedProfiles()
  // 화면에 들어올 때의 저장 목록 (해제해도 이번 방문 동안은 카드 유지)
  const items = useMemo(
    () =>
      [...MOCK_SAVED_PROFILES]
        .sort((a, b) => b.savedAt.localeCompare(a.savedAt)) // 최근 저장순
        .map((s) => ({ ...s, person: MOCK_PEOPLE.find((p) => p.id === s.personId)! }))
        .filter((s) => s.person),
    [],
  );

  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set(items.map((s) => s.personId)));
  const [offeredIds, setOfferedIds] = useState<Set<string>>(new Set());
  const [detailPerson, setDetailPerson] = useState<PersonSummary | null>(null);
  const [offerPerson, setOfferPerson] = useState<PersonSummary | null>(null);

  const privateCount = items.filter((s) => !s.person.isPublic).length;

  const toggleSave = (id: string, name: string) => {
    const isSaved = savedIds.has(id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(id);
      else next.add(id);
      return next;
    });
    // TODO: API 연결 시 bookmarksApi.unsaveProfile(id) / saveProfile(id)
    if (isSaved) toast(`${name} 님을 저장함에서 뺐어요`);
    else toast(`${name} 님을 다시 저장했어요`, 'success');
  };

  const openOffer = (person: PersonSummary) => {
    setDetailPerson(null);
    setOfferPerson(person);
  };

  const handleOfferSubmit = (payload: OfferPayload) => {
    // TODO: API 연결 시 participationApi.create(...)
    console.log('참여 제안', payload);
    setOfferedIds((prev) => new Set(prev).add(payload.personId));
    setOfferPerson(null);
    toast('참여 제안을 보냈어요', 'success');
  };

  const relationOf = (id: string) => items.find((s) => s.personId === id)?.relation ?? 'none';
  const canOffer = (id: string) => relationOf(id) === 'none' && !offeredIds.has(id);

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <strong>아직 저장한 프로필이 없어요</strong>
        관심 있는 구성원을 저장해 두면 여기에서 모아 볼 수 있어요.
        <div className={styles.emptyAction}>
          {/* TODO: 라우팅 생기면 /search/people 로 이동 */}
          <Button variant="ghost" size="sm" onClick={() => (window.location.search = '?page=people')}>
            사람 검색하러 가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.list}>
        <p className={styles.meta}>
          저장한 프로필 {items.length}개{privateCount > 0 && ` (비공개 전환 ${privateCount}개)`} | 최근 저장순
        </p>

        {items.map(({ person, relation }) => (
          <PersonCard
            key={person.id}
            person={person}
            skillText={skillSummary(person)}
            saved={savedIds.has(person.id)}
            onToggleSave={() => toggleSave(person.id, person.name)}
            onViewProfile={() => setDetailPerson(person)}
            action={
              <RelationAction
                relation={relation}
                offered={offeredIds.has(person.id)}
                onOffer={() => openOffer(person)}
                onViewApplication={() => toast('제안·지원 화면은 준비 중이에요')}
              />
            }
          />
        ))}
      </div>

      <ProfileDetailModal
        person={detailPerson}
        onClose={() => setDetailPerson(null)}
        saved={detailPerson ? savedIds.has(detailPerson.id) : false}
        onToggleSave={() => detailPerson && toggleSave(detailPerson.id, detailPerson.name)}
        onOffer={detailPerson && canOffer(detailPerson.id) ? () => openOffer(detailPerson) : undefined}
      />

      <OfferModal
        person={offerPerson}
        projects={MY_RECRUITING_PROJECTS}
        onClose={() => setOfferPerson(null)}
        onSubmit={handleOfferSubmit}
      />
    </>
  );
}