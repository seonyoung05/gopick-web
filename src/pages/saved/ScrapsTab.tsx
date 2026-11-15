// src/pages/saved/ScrapsTab.tsx
// 스크랩한 프로젝트 목록 (최근 스크랩순)
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi, type ProjectSummary } from '../../api';
import { useToast } from '../../components/common/Toast';
import { Button } from '../../components/ui/Button';
import { Status, type ProjectStatus } from '../../components/ui/Label';
import { ScrapButton } from '../projects/ScrapButton';
import styles from './SavedPage.module.css';
import s from './ScrapsTab.module.css';

/** 서버 상태 → 상태 라벨 + 프로젝트 화면의 탭 */
function statusOf(p: ProjectSummary): { status: ProjectStatus; tab: string } {
  if (p.lifecycleStatus === 'COMPLETED') return { status: 'done', tab: 'done' };
  if (p.lifecycleStatus === 'IN_PROGRESS') return { status: 'ongoing', tab: 'ongoing' };
  return { status: 'recruit', tab: 'recruit' };
}

interface ScrapsTabProps {
  /** 스크랩 개수가 바뀌면 탭 제목 숫자 갱신 */
  onCountChange?: (count: number) => void;
}

export function ScrapsTab({ onCountChange }: ScrapsTabProps) {
  const toast = useToast();
  const navigate = useNavigate();
  /** 화면에 들어올 때의 목록 (해제해도 이번 방문 동안은 카드 유지) */
  const [items, setItems] = useState<ProjectSummary[] | null>(null);
  const [scrapIds, setScrapIds] = useState<Set<number>>(new Set());
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let ignore = false;
    projectsApi
      .myScraps()
      .then((list) => {
        if (ignore) return;
        setItems(list);
        setScrapIds(new Set(list.map((p) => p.projectId)));
      })
      .catch(() => {
        if (!ignore) setFailed(true);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const toggle = async (p: ProjectSummary) => {
    const was = scrapIds.has(p.projectId);
    const next = new Set(scrapIds);
    if (was) next.delete(p.projectId);
    else next.add(p.projectId);
    setScrapIds(next);
    onCountChange?.(next.size);

    try {
      if (was) await projectsApi.unscrap(p.projectId);
      else await projectsApi.scrap(p.projectId);
      toast(was ? `${p.title} 스크랩을 해제했어요` : `${p.title}을(를) 다시 스크랩했어요`, was ? undefined : 'success');
    } catch {
      setScrapIds(scrapIds);
      onCountChange?.(scrapIds.size);
      toast('스크랩을 바꾸지 못했어요. 잠시 후 다시 시도해 주세요');
    }
  };

  if (failed) {
    return (
      <div className={styles.empty}>
        <strong>스크랩한 프로젝트를 불러오지 못했어요</strong>
        잠시 후 다시 시도해 주세요.
      </div>
    );
  }
  if (items === null) return <div className={styles.empty}>불러오는 중이에요…</div>;
  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <strong>아직 스크랩한 프로젝트가 없어요</strong>
        관심 있는 프로젝트를 스크랩해 두면 여기에서 모아 볼 수 있어요.
        <div className={styles.emptyAction}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            프로젝트 둘러보기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      <p className={styles.meta}>스크랩한 프로젝트 {items.length}개 | 최근 스크랩순</p>
      {items.map((p) => {
        const { status, tab } = statusOf(p);
        return (
          <article key={p.projectId} className={s.card}>
            <div className={s.top}>
              <Status status={status} />
              <ScrapButton scrapped={scrapIds.has(p.projectId)} onToggle={() => toggle(p)} />
            </div>
            <h3 className={`t-h3 ${s.title}`}>{p.title}</h3>
            {p.description && <p className={s.desc}>{p.description}</p>}
            <div className={s.actions}>
              <Button size="sm" variant="ghost" onClick={() => navigate(`/projects?tab=${tab}`)}>
                프로젝트에서 보기
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
