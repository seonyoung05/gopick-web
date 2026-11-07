// src/pages/inbox/InboxItem.tsx
import clsx from 'clsx';
import { Avatar } from '../../components/ui/Avatar';
import { Pill } from '../../components/ui/Label';
import type { Participation } from '../../types/participation';
import { itemSub, itemTitle, shortDate } from './inboxText';
import styles from './InboxPage.module.css';

interface InboxItemProps {
  item: Participation;
  selected: boolean;
  onSelect: () => void;
}

export function InboxItem({ item, selected, onSelect }: InboxItemProps) {
  const title = itemTitle(item);
  const isProject = item.direction === 'sent' && item.kind === 'apply';

  return (
    <button
      type="button"
      className={clsx(styles.item, selected && styles.itemSelected)}
      onClick={onSelect}
      aria-current={selected || undefined}
    >
      <Avatar name={title} seed={isProject ? item.project.id : item.counterpart.id} />
      <span className={styles.itemText}>
        <span className={styles.itemTitle}>{title}</span>
        <span className={styles.itemSub}>{itemSub(item)}</span>
        <span className={styles.itemMeta}>
          <Pill type={item.kind} />
          <Pill type={item.status} />
          <span className={styles.itemDate}>{shortDate(item.createdAt)}</span>
        </span>
      </span>
      {!item.read && <span className={styles.unread} aria-label="새 소식" />}
    </button>
  );
}