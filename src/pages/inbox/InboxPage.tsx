// src/pages/inbox/InboxPage.tsx
import { useMemo, useState } from 'react';
import { Tabs } from '../../components/ui/Tabs';
import { useToast } from '../../components/common/Toast';
import { MOCK_PARTICIPATIONS, mockContactOf } from '../../mocks/participations';
import type { Participation, ParticipationDirection } from '../../types/participation';
import { InboxItem } from './InboxItem';
import { InboxDetail } from './InboxDetail';
import styles from './InboxPage.module.css';

const byNewest = (a: Participation, b: Participation) => b.createdAt.localeCompare(a.createdAt);

/** 처음 들어왔을 때 받은 내역의 가장 최근 항목을 열어 둠 */
const FIRST_ID = MOCK_PARTICIPATIONS.filter((p) => p.direction === 'received').sort(byNewest)[0]?.id ?? null;

export default function InboxPage() {
  const toast = useToast();

  // TODO: API 연결 시 participationApi.getMine()
  const [items, setItems] = useState<Participation[]>(() =>
    MOCK_PARTICIPATIONS.map((p) => (p.id === FIRST_ID ? { ...p, read: true } : p)),
  );
  const [tab, setTab] = useState<ParticipationDirection>('received');
  const [selectedId, setSelectedId] = useState<string | null>(FIRST_ID);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(['p9']));

  const list = useMemo(() => items.filter((p) => p.direction === tab).sort(byNewest), [items, tab]);
  const selected = list.find((p) => p.id === selectedId) ?? null;
  const unreadCount = (dir: ParticipationDirection) =>
    items.filter((p) => p.direction === dir && !p.read).length;

  /** 한 항목만 바꾸는 도우미 */
  const patch = (id: string, change: Partial<Participation>) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...change } : p)));

  const select = (id: string) => {
    setSelectedId(id);
    patch(id, { read: true });
  };

  const changeTab = (next: ParticipationDirection) => {
    setTab(next);
    setSelectedId(null); // 탭을 바꾸면 "왼쪽에서 항목을 골라 주세요"
  };

  /* ---------- 동작 ---------- */
  const accept = (item: Participation, reply: string) => {
    // TODO: API 연결 시 participationApi.accept(item.id, reply)
    patch(item.id, {
      status: 'accepted',
      reply: reply || undefined,
      contact: mockContactOf(item.counterpart.id),
    });
    toast(item.kind === 'offer' ? `${item.project.name} 팀에 합류했어요` : `${item.counterpart.name} 님이 팀원이 됐어요`, 'success');
  };

  const reject = (item: Participation, reply: string) => {
    const kind = item.kind === 'offer' ? '제안' : '지원';
    if (!window.confirm(`이 ${kind}을 거절할까요? 거절하면 되돌릴 수 없어요.`)) return;
    // TODO: API 연결 시 participationApi.reject(item.id, reply)
    patch(item.id, { status: 'declined', reply: reply || undefined });
    toast(`${kind}을 거절했어요`);
  };

  const cancel = (item: Participation) => {
    const kind = item.kind === 'offer' ? '제안' : '지원';
    if (!window.confirm(`보낸 ${kind}을 취소할까요?`)) return;
    // TODO: API 연결 시 participationApi.cancel(item.id)
    patch(item.id, { status: 'canceled' });
    toast(`${kind}을 취소했어요`);
  };

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

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className="t-h1">제안·지원</h1>
        <p>
          받은 참여 제안, 내 프로젝트에 들어온 지원, 내가 보낸 내역을 한곳에서 관리해요. 수락하면 서로의 연락처가
          공개돼요.
        </p>
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
          {list.length === 0 ? (
            <p className={styles.emptyList}>
              {tab === 'received' ? '아직 받은 제안이나 지원이 없어요.' : '아직 보낸 제안이나 지원이 없어요.'}
            </p>
          ) : (
            list.map((item) => (
              <InboxItem
                key={item.id}
                item={item}
                selected={item.id === selectedId}
                onSelect={() => select(item.id)}
              />
            ))
          )}
        </div>

        {selected ? (
          <InboxDetail
            key={selected.id} /* 다른 항목을 열면 답장 입력칸 초기화 */
            item={selected}
            saved={savedIds.has(selected.counterpart.id)}
            onToggleSave={() => toggleSave(selected.counterpart.id, selected.counterpart.name)}
            onAccept={(reply) => accept(selected, reply)}
            onReject={(reply) => reject(selected, reply)}
            onCancel={() => cancel(selected)}
            onViewProject={() => toast('프로젝트 상세는 준비 중이에요')}
          />
        ) : (
          <div className={styles.placeholder}>왼쪽에서 항목을 골라 주세요.</div>
        )}
      </div>
    </div>
  );
}