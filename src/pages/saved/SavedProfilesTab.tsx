// src/pages/saved/SavedProfilesTab.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError, ERROR_CODE, profilesApi, type BookmarkedProfile } from '../../api';
import { personFromDetail } from '../../api/mappers/person';
import { PersonCard, RelationAction } from '../../components/common/PersonCard';
import { ProfileDetailModal } from '../../components/common/ProfileDetailModal';
import { OfferModal, type OfferPayload } from '../../components/common/OfferModal';
import { useToast } from '../../components/common/Toast';
import { Button } from '../../components/ui/Button';
import { participationErrorText } from '../../api/mappers/participation';
import { useOfferContext } from '../../hooks/useOfferContext';
import type { PersonSummary } from '../../types/person';
import { skillSummary } from '../people/filterPeople';
import styles from './SavedPage.module.css';

/** 비공개로 바뀐 프로필은 이름만 있는 카드로 */
const privatePerson = (b: BookmarkedProfile): PersonSummary => ({
  id: String(b.profileId),
  name: b.name,
  major: '',
  isPublic: false,
  roles: [],
  skills: [],
  fields: [],
  tendencies: [],
  collab: [],
  intro: '',
});

/** 북마크 한 줄 → 카드용 사람 정보 (공개 프로필은 상세를 불러와서 채움) */
async function loadPerson(b: BookmarkedProfile): Promise<PersonSummary> {
  if (!b.isPublic) return privatePerson(b);
  try {
    return personFromDetail(await profilesApi.get(b.profileId));
  } catch (e) {
    // 목록을 받은 사이에 비공개로 바뀐 경우
    if (e instanceof ApiError && e.code === ERROR_CODE.PRIVATE_PROFILE) return privatePerson(b);
    throw e;
  }
}

interface SavedProfilesTabProps {
  /** 저장 개수가 바뀌면 탭 제목 숫자 갱신 */
  onCountChange?: (count: number) => void;
}

type LoadStatus = 'loading' | 'error' | 'done';

export function SavedProfilesTab({ onCountChange }: SavedProfilesTabProps) {
  const toast = useToast();
  const navigate = useNavigate();

  // 화면에 들어올 때 불러온 저장 목록 (최근 저장순). 실제로 보이는 카드는 savedIds에 든 것만
  const [loaded, setLoaded] = useState<PersonSummary[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const offer = useOfferContext();
  const [detailPerson, setDetailPerson] = useState<PersonSummary | null>(null);
  const [offerPerson, setOfferPerson] = useState<PersonSummary | null>(null);

  useEffect(() => {
    let ignore = false;
    profilesApi
      .myBookmarks()
      .then((bookmarks) => Promise.all(bookmarks.map(loadPerson)))
      .then((people) => {
        if (ignore) return;
        setLoaded(people);
        setSavedIds(new Set(people.map((p) => p.id)));
        setStatus('done');
      })
      .catch(() => {
        if (!ignore) setStatus('error');
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setStatus('loading');
    setReloadKey((k) => k + 1);
  };

  // 해제한 카드는 바로 빼서, 탭 숫자·본문 숫자·카드 목록이 항상 같게 해요
  const items = loaded.filter((p) => savedIds.has(p.id));
  const privateCount = items.filter((p) => !p.isPublic).length;

  const toggleSave = async (id: string, name: string) => {
    const isSaved = savedIds.has(id);
    const next = new Set(savedIds);
    if (isSaved) next.delete(id);
    else next.add(id);
    setSavedIds(next);
    onCountChange?.(next.size);

    try {
      if (isSaved) await profilesApi.unbookmark(Number(id));
      else await profilesApi.bookmark(Number(id));
      if (isSaved) toast(`${name} 님을 저장함에서 뺐어요`);
      else toast(`${name} 님을 다시 저장했어요`, 'success');
    } catch (e) {
      setSavedIds(savedIds);
      onCountChange?.(savedIds.size);
      if (e instanceof ApiError && e.code === ERROR_CODE.PRIVATE_PROFILE) {
        toast('비공개로 바뀐 프로필은 다시 저장할 수 없어요');
      } else {
        toast('저장을 바꾸지 못했어요. 잠시 후 다시 시도해 주세요');
      }
    }
  };

  const openOffer = (person: PersonSummary) => {
    setDetailPerson(null);
    setOfferPerson(person);
  };

  const handleOfferSubmit = async (payload: OfferPayload) => {
    try {
      await offer.sendOffer(payload);
      setOfferPerson(null);
      toast('참여 제안을 보냈어요', 'success');
    } catch (e) {
      toast(participationErrorText(e, 'offer'));
    }
  };

  if (status === 'loading') return <div className={styles.empty}>저장한 프로필을 불러오는 중이에요…</div>;

  if (status === 'error') {
    return (
      <div className={styles.empty}>
        <strong>저장한 프로필을 불러오지 못했어요</strong>
        잠시 후 다시 시도해 주세요.
        <div className={styles.emptyAction}>
          <Button variant="ghost" size="sm" onClick={retry}>
            다시 불러오기
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <strong>아직 저장한 프로필이 없어요</strong>
        관심 있는 구성원을 저장해 두면 여기에서 모아 볼 수 있어요.
        <div className={styles.emptyAction}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/search')}>
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

        {items.map((person) => (
          <PersonCard
            key={person.id}
            person={person}
            skillText={skillSummary(person)}
            saved={savedIds.has(person.id)}
            onToggleSave={() => toggleSave(person.id, person.name)}
            onViewProfile={() => setDetailPerson(person)}
            action={
              <RelationAction
                relation={offer.relationOf(person.id)}
                offered={false}
                onOffer={() => openOffer(person)}
                onViewApplication={() => navigate('/offers')}
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
        onOffer={
          detailPerson && offer.relationOf(detailPerson.id) === 'none' ? () => openOffer(detailPerson) : undefined
        }
      />

      <OfferModal
        person={offerPerson}
        projects={offer.projects}
        status={offer.status}
        onClose={() => setOfferPerson(null)}
        onSubmit={handleOfferSubmit}
      />
    </>
  );
}
