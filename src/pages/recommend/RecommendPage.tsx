// src/pages/recommend/RecommendPage.tsx
import { useState } from 'react';
import { ChipGroup } from '../../components/ui/Chip';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/common/Toast';
import { ProfileDetailModal } from '../../components/common/ProfileDetailModal';
import { OfferModal, type OfferPayload } from '../../components/common/OfferModal';
import { MY_RECRUITING_PROJECTS } from '../../mocks/myProjects';
import { MOCK_RECOMMENDATIONS } from '../../mocks/recommendations';
import type { PersonSummary } from '../../types/person';
import { MatchCard } from './MatchCard';
import styles from './RecommendPage.module.css';

// TODO: 라우팅 생기면 주소에서 projectId를 받아 오기 (/projects/:id/recommend)
const project = MY_RECRUITING_PROJECTS[0];

export default function RecommendPage() {
  const toast = useToast();

  const roleLabel = (r: { role: string; remaining: number }) => `${r.role} ${r.remaining}명 모집`;
  const [roleText, setRoleText] = useState(roleLabel(project.recruitments[0]));
  const recruitment = project.recruitments.find((r) => roleLabel(r) === roleText)!;

  // TODO: API 연결 시 recommendationsApi.getForProject(project.id, { recruitmentId })
  const recs = [...(MOCK_RECOMMENDATIONS[recruitment.recruitmentId] ?? [])].sort(
    (a, b) => a.rank - b.rank || a.person.name.localeCompare(b.person.name, 'ko'),
  );
  /** 같은 순위가 2명 이상이면 "공동" 표시 */
  const isTie = (rank: number) => recs.filter((r) => r.rank === rank).length > 1;

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(['p9']));
  const [offeredIds, setOfferedIds] = useState<Set<string>>(new Set());
  const [detailPerson, setDetailPerson] = useState<PersonSummary | null>(null);
  const [offerPerson, setOfferPerson] = useState<PersonSummary | null>(null);

  const toggleSave = (id: string, name: string) => {
    const isSaved = savedIds.has(id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(id);
      else next.add(id);
      return next;
    });
    if (isSaved) toast(`${name} 님을 저장함에서 뺐어요`);
    else toast(`${name} 님을 저장했어요`, 'success');
  };

  const openOffer = (person: PersonSummary) => {
    setDetailPerson(null);
    setOfferPerson(person);
  };

  const handleOfferSubmit = (payload: OfferPayload) => {
    // TODO: API 연결 시 participationApi.create(payload.projectId, { type: 'OFFER', ... })
    console.log('참여 제안', payload);
    setOfferedIds((prev) => new Set(prev).add(payload.personId));
    setOfferPerson(null);
    toast('참여 제안을 보냈어요', 'success');
  };

  /** 상세 모달에서 제안 버튼을 보여 줄지 */
  const canOffer = (personId: string) => {
    const rec = recs.find((r) => r.person.id === personId);
    return rec?.relation === 'none' && !offeredIds.has(personId);
  };

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        {/* TODO: 라우팅 생기면 navigate(-1) 또는 홈으로 */}
        <button type="button" className={styles.back} onClick={() => history.back()}>
          이전으로 돌아가기
        </button>
        <h1 className="t-h1">{project.name} 추천 팀원</h1>
        <p>
          모집 {project.recruitments.map(roleLabel).join(', ')} | 분야 AI, 웹 | 목적 해커톤, 포트폴리오
        </p>
      </div>

      <div className={styles.layout}>
        <section className={styles.results} aria-label="추천 결과">
          <ChipGroup
            options={project.recruitments.map(roleLabel)}
            value={roleText}
            onChange={setRoleText}
            aria-label="모집 역할"
          />
          <p className={styles.meta}>
            {recruitment.role} 추천 {recs.length}명 | 적합한 순, 동점은 이름순
          </p>

          {recs.length === 0 ? (
            <div className={styles.empty}>
              아직 조건에 맞는 추천 팀원이 없어요. 사람 검색에서 직접 찾아보세요.
            </div>
          ) : (
            recs.map((rec) => (
              <MatchCard
                key={rec.person.id}
                rec={rec}
                isTie={isTie(rec.rank)}
                saved={savedIds.has(rec.person.id)}
                offered={offeredIds.has(rec.person.id)}
                onViewProfile={() => setDetailPerson(rec.person)}
                onToggleSave={() => toggleSave(rec.person.id, rec.person.name)}
                onOffer={() => openOffer(rec.person)}
                onViewApplication={() => toast('제안·지원 화면은 준비 중이에요')}
              />
            ))
          )}

          <div className={styles.more}>
            <div>
              <strong>추천 결과가 마음에 들지 않나요?</strong>
              <p>사람 검색에서 필터를 바꿔 가며 더 다양한 사람을 찾아보세요.</p>
            </div>
            {/* TODO: 라우팅 생기면 /search/people 로 이동 */}
            <Button variant="ghost" size="sm" onClick={() => (window.location.search = '?page=people')}>
              사람 검색으로 더 찾기
            </Button>
          </div>
        </section>

        <aside className={styles.aside} aria-label="추천 기준">
          <h2>추천 기준</h2>
          <ol className={styles.priority}>
            <li>기술 스택</li>
            <li>협업 성향</li>
            <li>프로젝트 경험</li>
          </ol>
          <ul className={styles.basis}>
            <li>위 순서대로 더 중요하게 반영해 적합한 순서로 보여줘요. 학과·소속 파트는 참고만 해요.</li>
            <li>카드마다 일치 항목과 불일치 항목을 중요한 순서대로 보여줘요.</li>
            <li>점수는 공개하지 않아요. 동점자는 모두 포함하고 이름순으로 정렬해요.</li>
            <li>비공개 프로필과 이미 팀원인 사람은 추천하지 않아요.</li>
          </ul>
        </aside>
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
        defaultRecruitmentId={recruitment.recruitmentId}
        onClose={() => setOfferPerson(null)}
        onSubmit={handleOfferSubmit}
      />
    </div>
  );
}