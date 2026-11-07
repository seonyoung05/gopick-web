// src/pages/people/PeopleSearchPage.tsx
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { FilterPanel, createFilterValues } from '../../components/common/FilterPanel';
import { PersonCard } from '../../components/common/PersonCard';
import { useToast } from '../../components/common/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Segment } from '../../components/ui/Segment';
import { PEOPLE_FILTERS } from '../../constants/filters';
import { MOCK_PEOPLE } from '../../mocks/people';
import { filterPeople, skillSummary } from './filterPeople';
import styles from './PeopleSearchPage.module.css';
import { ProfileDetailModal } from '../../components/common/ProfileDetailModal';
import { OfferModal, type OfferPayload } from '../../components/common/OfferModal';
import { MY_RECRUITING_PROJECTS } from '../../mocks/myProjects';
import type { PersonSummary } from '../../types/person';

export default function PeopleSearchPage() {
  const toast = useToast();
  const [keyword, setKeyword] = useState('');
  const [filters, setFilters] = useState(() => createFilterValues(PEOPLE_FILTERS));
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  /** 지금 상세를 보고 있는 사람 (null이면 닫힘) */
  const [detailPerson, setDetailPerson] = useState<PersonSummary | null>(null);
  /** 지금 제안을 쓰고 있는 사람 (null이면 닫힘) */
  const [offerPerson, setOfferPerson] = useState<PersonSummary | null>(null);
  /** 제안을 보낸 사람 ID */
  const [offeredIds, setOfferedIds] = useState<Set<string>>(new Set());
  // 검색어나 필터가 바뀔 때만 다시 계산
  const results = useMemo(
    () =>
      filterPeople(MOCK_PEOPLE, filters, keyword).sort((a, b) => a.name.localeCompare(b.name, 'ko')),
    [filters, keyword],
  );
  const privateCount = MOCK_PEOPLE.filter((p) => !p.isPublic).length;

  const toggleSave = (id: string, name: string) => {
    const isSaved = savedIds.has(id);

    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(id);
      else next.add(id);
      return next;
    });

    // 토스트는 상태 변경 함수 바깥에서
    if (isSaved) toast(`${name} 님을 저장함에서 뺐어요`);
    else toast(`${name} 님을 저장했어요`, 'success');
  };

  const openOffer = (person: PersonSummary) => {
    setDetailPerson(null); // 상세 모달에서 넘어온 경우 상세는 닫기
    setOfferPerson(person);
  };

  const handleOfferSubmit = (payload: OfferPayload) => {
    // TODO: API 연결 시 participationApi.create(payload.projectId, { type: 'OFFER', ... })
    console.log('참여 제안', payload);
    setOfferedIds((prev) => new Set(prev).add(payload.personId));
    setOfferPerson(null);
    toast('참여 제안을 보냈어요', 'success');
  };

  const resetAll = () => {
    setKeyword('');
    setFilters(createFilterValues(PEOPLE_FILTERS));
  };

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className="t-h1">검색</h1>
        <p>함께할 팀원을 찾는다면 사람을, 참여할 프로젝트를 찾는다면 프로젝트를 검색해 보세요.</p>
      </div>

      <div className={styles.top}>
        <Segment
          size="lg"
          options={['사람', '프로젝트']}
          value="사람"
          onChange={(v) => {
            // TODO: 라우팅 생기면 프로젝트 검색(B 담당)으로 이동
            if (v === '프로젝트') toast('프로젝트 검색은 준비 중이에요');
          }}
          aria-label="검색 대상"
        />
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} aria-hidden="true" />
          <Input
            className={styles.searchInput}
            type="search"
            placeholder="이름, 전공, 소개로 사람 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            aria-label="사람 검색"
          />
        </div>
      </div>

      <div className={styles.layout}>
        <FilterPanel groups={PEOPLE_FILTERS} values={filters} onChange={setFilters} />

        <section className={styles.results} aria-label="검색 결과">
          <div className={styles.resultHead}>
            <span>
              사람 <strong>{results.length}명</strong> + 비공개 {privateCount}명 | 고른 조건에 맞는 사람만
              보여줘요
            </span>
            <span>이름순</span>
          </div>

          {results.length === 0 ? (
            <div className={styles.empty}>
              <strong>조건에 맞는 사람이 없어요</strong>
              검색어를 바꾸거나 필터를 줄여 보세요.
              <div style={{ marginTop: 16 }}>
                <Button variant="ghost" size="sm" onClick={resetAll}>
                  검색 조건 초기화
                </Button>
              </div>
            </div>
          ) : (
            results.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                skillText={skillSummary(person)}
                saved={savedIds.has(person.id)}
                onToggleSave={() => toggleSave(person.id, person.name)}
                onViewProfile={() => setDetailPerson(person)}
                action={
                  offeredIds.has(person.id) ? (
                    <Button variant="ghost" size="sm" block disabled>
                      제안 보냄
                    </Button>
                  ) : (
                    <Button size="sm" block onClick={() => openOffer(person)}>
                      참여 제안 보내기
                    </Button>
                  )
                }
              />
            ))
          )}
        </section>
      </div>
      <ProfileDetailModal
        person={detailPerson}
        onClose={() => setDetailPerson(null)}
        saved={detailPerson ? savedIds.has(detailPerson.id) : false}
        onToggleSave={() => detailPerson && toggleSave(detailPerson.id, detailPerson.name)}
        onOffer={
          detailPerson && !offeredIds.has(detailPerson.id) ? () => openOffer(detailPerson) : undefined
        }
      />

      <OfferModal
        person={offerPerson}
        projects={MY_RECRUITING_PROJECTS}
        onClose={() => setOfferPerson(null)}
        onSubmit={handleOfferSubmit}
      />
    </div>
  );
}