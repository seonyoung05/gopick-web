// src/components/layout/NotificationMenu/NotificationMenu.tsx
// 탑바 🔔: 누르면 알림 목록이 펼쳐지고, 하나를 누르면 읽음 처리 후 관련 화면으로 이동
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Bell } from 'lucide-react';
import { notificationsApi, projectsApi, type NotificationResponse } from '../../../api';
import { useAuth } from '../../../stores/auth';
import { Badge } from '../../ui/Label';
import { KIND, RECEIVED_TYPES, SENT_TYPES, notificationText, timeAgo } from './notificationText';
import styles from './NotificationMenu.module.css';

/** 새 알림 확인 주기 */
const POLL_MS = 60_000;
/** 목록에 보여 줄 최대 개수 */
const MAX_ITEMS = 50;

const REQUEST_GONE = '이미 처리됐거나 사라져서 확인할 수 없는 요청이에요.';
const PROJECT_GONE = '삭제됐거나 볼 수 없는 프로젝트예요.';

type Target = { to: string } | { notice: string };

export function NotificationMenu() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { account } = useAuth();
  const myProfileId = account?.profileId;

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationResponse[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    notificationsApi
      .list()
      .then((list) => {
        setItems(list);
        setFailed(false);
      })
      .catch(() => setFailed(true)); // 배지는 지난 값을 그대로 둠
  }, []);

  // 처음 · 화면 이동 · 펼칠 때 · 1분마다 · 창으로 돌아올 때 새로 불러오기
  useEffect(load, [load, pathname]);
  useEffect(() => {
    if (open) load();
  }, [open, load]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, POLL_MS);
    window.addEventListener('focus', load);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', load);
    };
  }, [load]);

  // 바깥 클릭 · ESC로 닫기
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const unread = (items ?? []).filter((n) => !n.read).length;

  const markRead = (n: NotificationResponse) => {
    if (n.read) return;
    setItems((prev) => prev?.map((x) => (x.id === n.id ? { ...x, read: true } : x)) ?? prev);
    notificationsApi.read(n.id).catch(() => undefined); // 실패하면 다음에 불러올 때 다시 안 읽음으로 보여요
  };

  const readAll = () => (items ?? []).filter((n) => !n.read).forEach(markRead);

  /** 알림을 눌렀을 때 갈 곳 */
  const targetOf = async (n: NotificationResponse): Promise<Target> => {
    if (RECEIVED_TYPES.includes(n.type) || SENT_TYPES.includes(n.type)) {
      if (!n.requestAvailable || n.requestId == null) return { notice: REQUEST_GONE };
      const tab = RECEIVED_TYPES.includes(n.type) ? 'received' : 'sent';
      return { to: `/offers?tab=${tab}&id=${n.requestId}` };
    }
    if (n.type === 'PROJECT_DELETED') return { notice: '삭제된 프로젝트라 열 수 없어요.' };

    // 팀장 변경 · 팀원 하차 · 시작 · 단계 · 완료: 지금 프로젝트 상태에 맞는 화면으로
    try {
      const p = await projectsApi.get(n.projectId);
      if (p.lifecycleStatus === 'COMPLETED') return { to: `/projects?tab=done&project=${p.projectId}` };
      if (p.lifecycleStatus === 'IN_PROGRESS') return { to: `/projects?tab=ongoing&project=${p.projectId}` };
      const isLeader = p.members.some((m) => m.profileId === myProfileId && m.authority === 'LEADER');
      return { to: isLeader ? `/manage?id=${p.projectId}` : '/projects?tab=recruit' };
    } catch {
      return { notice: PROJECT_GONE };
    }
  };

  const openItem = async (n: NotificationResponse) => {
    markRead(n);
    setNotice(null);
    setBusyId(n.id);
    const target = await targetOf(n);
    setBusyId(null);
    if ('notice' in target) {
      setNotice(target.notice);
      return;
    }
    setOpen(false);
    navigate(target.to);
  };

  const renderList = () => {
    if (items === null) {
      return <li className={styles.empty}>{failed ? '알림을 불러오지 못했어요.' : '불러오는 중이에요…'}</li>;
    }
    if (items.length === 0) return <li className={styles.empty}>아직 알림이 없어요</li>;
    return items.slice(0, MAX_ITEMS).map((n) => {
      const kind = KIND[n.type] ?? KIND.PROJECT_STAGE_CHANGED; // 모르는 종류가 와도 화면이 깨지지 않게
      const Icon = kind.icon;
      return (
        <li key={n.id}>
          <button
            type="button"
            className={clsx(styles.item, !n.read && styles.unread)}
            onClick={() => openItem(n)}
            disabled={busyId === n.id}
          >
            <span className={clsx(styles.icon, styles[kind.tone])}>
              <Icon size={16} aria-hidden="true" />
            </span>
            <span className={styles.body}>
              <span className={styles.text}>{notificationText(n)}</span>
              <span className={styles.time}>{timeAgo(n.createdAt)}</span>
            </span>
            {!n.read && <span className={styles.dot} aria-label="안 읽음" />}
          </button>
        </li>
      );
    });
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={clsx(styles.trigger, open && styles.triggerOpen)}
        aria-label={unread > 0 ? `알림, 안 읽은 알림 ${unread}개` : '알림'}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="알림"
        onClick={() => {
          setNotice(null);
          setOpen((v) => !v);
        }}
      >
        <Bell size={22} aria-hidden="true" />
        <Badge count={unread} className={styles.badge} />
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label="알림">
          <div className={styles.head}>
            <strong>알림</strong>
            {unread > 0 && (
              <button type="button" className={styles.textButton} onClick={readAll}>
                모두 읽음
              </button>
            )}
          </div>

          {notice && (
            <p className={styles.notice} role="status">
              {notice}
            </p>
          )}

          <ul className={styles.list}>{renderList()}</ul>

          <button
            type="button"
            className={styles.footer}
            onClick={() => {
              setOpen(false);
              navigate('/offers');
            }}
          >
            제안·지원 전체 보기
          </button>
        </div>
      )}
    </div>
  );
}
