// src/pages/inbox/InboxPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  participationApi,
  profilesApi,
  projectsApi,
  type ParticipationRequestResponse,
  type ParticipationResolveStatus,
  type ProjectDetail,
} from '../../api';
import { personFromDetail } from '../../api/mappers/person';
import { participationErrorText } from '../../api/mappers/participation';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { useToast } from '../../components/common/Toast';
import type { Participation, ParticipationDirection } from '../../types/participation';
import type { PersonSummary } from '../../types/person';
import { InboxItem } from './InboxItem';
import { InboxDetail } from './InboxDetail';
import { isRead, loadSeen, saveSeen, seenKey } from './seenStore';
import { counterpartIdOf, toParticipation, unknownPerson } from './toParticipation';
import styles from './InboxPage.module.css';

type LoadStatus = 'loading' | 'error' | 'done';

const byNewest = (a: Participation, b: Participation) => b.createdAt.localeCompare(a.createdAt);

/** id 목록을 중복 없이 한 번씩 불러와서 Map으로 (실패한 것은 빠짐) */
async function loadMap<T>(ids: number[], load: (id: number) => Promise<T>) {
  const unique = [...new Set(ids)];
  const results = await Promise.allSettled(unique.map(load));
  const map = new Map<number, T>();
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') map.set(unique[i], r.value);
  });
  return map;
}

/** 받은·보낸 요청 → 화면 카드 (프로젝트 상세·상대 프로필을 함께 불러옴) */
async function loadInbox(): Promise<Participation[]> {
  const [received, sent] = await Promise.all([participationApi.received(), participationApi.sent()]);
  const all: [ParticipationRequestResponse, ParticipationDirection][] = [
    ...received.map((r) => [r, 'received'] as [ParticipationRequestResponse, ParticipationDirection]),
    ...sent.map((r) => [r, 'sent'] as [ParticipationRequestResponse, ParticipationDirection]),
  ];

  const projects = await loadMap<ProjectDetail>(
    all.map(([r]) => r.projectId),
    (id) => projectsApi.get(id),
  );
  const personIds = all
    .map(([r, dir]) => counterpartIdOf(r, dir, projects.get(r.projectId)))
    .filter((id): id is number => id !== undefined);
  // 비공개 프로필은 403이라 빠지고, 아래에서 '비공개 프로필'로 채움
  const people = await loadMap<PersonSummary>(personIds, async (id) => personFromDetail(await profilesApi.get(id)));

  const seen = loadSeen();
  return all.map(([r, dir]) => {
    const project = projects.get(r.projectId);
    const personId = counterpartIdOf(r, dir, project);
    const leaderName = project?.members.find((m) => m.authority === 'LEADER')?.name ?? undefined;
    const counterpart =
      (personId !== undefined && people.get(personId)) ||
      unknownPerson(personId, dir === 'sent' && r.type === 'APPLY' ? leaderName : undefined);
    const item = toParticipation(r, dir, { project, counterpart, read: false });
    return { ...item, read: isRead(item, seen) };
  });
}

export default function InboxPage() {
  const toast = useToast();
  const navigate = useNavigate();

  const [items, setItems] = useState<Participation[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const [tab, setTab] = useState<ParticipationDirection>('received');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let ignore = false;
    Promise.all([loadInbox(), profilesApi.myBookmarks().catch(() => [])])
      .then(([list, bookmarks]) => {
        if (ignore) return;
        setItems(list);
        setSavedIds(new Set(bookmarks.map((b) => String(b.profileId))));
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

  const list = useMemo(() => items.filter((p) => p.direction === tab).sort(byNewest), [items, tab]);
  const selected = list.find((p) => p.id === selectedId) ?? null;
  const unreadCount = (dir: ParticipationDirection) =>
    items.filter((p) => p.direction === dir && !p.read).length;

  /** 한 항목만 바꾸는 도우미 */
  const patch = (id: string, change: Partial<Participation>) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...change } : p)));

  /** 읽음 표시 (이 브라우저에 저장) */
  const markRead = (item: Participation) => {
    if (item.read) return;
    const seen = loadSeen();
    seen.add(seenKey(item));
    saveSeen(seen);
    patch(item.id, { read: true });
  };

  const select = (item: Participation) => {
    setSelectedId(item.id);
    markRead(item);
  };

  const changeTab = (next: ParticipationDirection) => {
    setTab(next);
    setSelectedId(null); // 탭을 바꾸면 "왼쪽에서 항목을 골라 주세요"
  };

  /* ---------- 수락 · 거절 · 취소 ---------- */
  const resolve = async (item: Participation, next: ParticipationResolveStatus, done: string) => {
    setBusy(true);
    try {
      const res = await participationApi.resolve(Number(item.project.id), Number(item.id), next);
      const status = res.status === 'ACCEPTED' ? 'accepted' : res.status === 'REJECTED' ? 'declined' : 'canceled';
      patch(item.id, { status, read: true });
      const seen = loadSeen();
      seen.add(seenKey({ id: item.id, status }));
      saveSeen(seen);
      toast(done, next === 'ACCEPTED' ? 'success' : undefined);
    } catch (e) {
      toast(participationErrorText(e, item.kind));
    } finally {
      setBusy(false);
    }
  };

  const accept = (item: Participation) =>
    resolve(
      item,
      'ACCEPTED',
      item.kind === 'offer' ? `${item.project.name} 팀에 합류했어요` : `${item.counterpart.name} 님이 팀원이 됐어요`,
    );

  const reject = (item: Participation) => {
    const kind = item.kind === 'offer' ? '제안' : '지원';
    if (!window.confirm(`이 ${kind}을 거절할까요? 거절하면 되돌릴 수 없어요.`)) return;
    resolve(item, 'REJECTED', `${kind}을 거절했어요`);
  };

  const cancel = (item: Participation) => {
    const kind = item.kind === 'offer' ? '제안' : '지원';
    if (!window.confirm(`보낸 ${kind}을 취소할까요?`)) return;
    resolve(item, 'CANCELED', `${kind}을 취소했어요`);
  };

  const toggleSave = async (person: PersonSummary) => {
    const id = person.id;
    const wasSaved = savedIds.has(id);
    const apply = (on: boolean) =>
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (on) next.add(id);
        else next.delete(id);
        return next;
      });
    apply(!wasSaved);
    try {
      if (wasSaved) await profilesApi.unbookmark(Number(id));
      else await profilesApi.bookmark(Number(id));
      toast(wasSaved ? `${person.name} 님을 저장함에서 뺐어요` : `${person.name} 님을 저장했어요`, wasSaved ? undefined : 'success');
    } catch {
      apply(wasSaved);
      toast('저장을 바꾸지 못했어요. 잠시 후 다시 시도해 주세요');
    }
  };

  const renderList = () => {
    if (status === 'loading') return <p className={styles.emptyList}>불러오는 중이에요…</p>;
    if (status === 'error') {
      return (
        <div className={styles.emptyList}>
          <p>제안·지원 내역을 불러오지 못했어요.</p>
          <Button variant="ghost" size="sm" onClick={retry}>
            다시 불러오기
          </Button>
        </div>
      );
    }
    if (list.length === 0) {
      return (
        <p className={styles.emptyList}>
          {tab === 'received' ? '아직 받은 제안이나 지원이 없어요.' : '아직 보낸 제안이나 지원이 없어요.'}
        </p>
      );
    }
    return list.map((item) => (
      <InboxItem key={item.id} item={item} selected={item.id === selectedId} onSelect={() => select(item)} />
    ));
  };

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className="t-h1">제안·지원</h1>
        <p>받은 참여 제안, 내 프로젝트에 들어온 지원, 내가 보낸 내역을 한곳에서 관리해요. 수락하면 팀에 합류해요.</p>
      </div>

      <Tabs
        aria-label="제안·지원"
        value={tab}
        onChange={changeTab}
        items={[
          { value: 'received', label: '받은 내역', count: unreadCount('received') },
          { value: 'sent', label: '보낸 내역', count: unreadCount('sent') },
        ]}
      />

      <div className={styles.layout}>
        <div className={styles.list} role="tabpanel">
          {renderList()}
        </div>

        {selected ? (
          <InboxDetail
            key={selected.id}
            item={selected}
            busy={busy}
            saved={savedIds.has(selected.counterpart.id)}
            onToggleSave={() => toggleSave(selected.counterpart)}
            onAccept={() => accept(selected)}
            onReject={() => reject(selected)}
            onCancel={() => cancel(selected)}
            onViewProject={() => navigate('/projects?tab=recruit')}
          />
        ) : (
          <div className={styles.placeholder}>왼쪽에서 항목을 골라 주세요.</div>
        )}
      </div>
    </div>
  );
}
