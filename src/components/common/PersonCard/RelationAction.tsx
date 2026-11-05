// src/components/common/PersonCard/RelationAction.tsx
import { Button } from '../../ui/Button';
import type { RecommendRelation } from '../../../types/recommendation';
import styles from './PersonCard.module.css';

interface RelationActionProps {
  relation: RecommendRelation;
  /** 이 화면에서 방금 제안을 보냈는지 */
  offered: boolean;
  onOffer: () => void;
  onViewApplication: () => void;
}

/** 나와의 관계에 따라 세 번째 버튼을 정함 (검색·추천·저장함 공용) */
export function RelationAction({ relation, offered, onOffer, onViewApplication }: RelationActionProps) {
  if (relation === 'applied') {
    return (
      <Button variant="ghost" size="sm" block onClick={onViewApplication}>
        받은 지원 보기
      </Button>
    );
  }
  if (relation === 'member') {
    return <p className={styles.actionNote}>이미 팀원이에요</p>;
  }
  if (relation === 'rejected') {
    return (
      <>
        <Button variant="ghost" size="sm" block disabled>
          제안 불가
        </Button>
        <p className={styles.actionNote}>거절된 제안이 있어요</p>
      </>
    );
  }
  if (offered || relation === 'offered') {
    return (
      <Button variant="ghost" size="sm" block disabled>
        제안 보냄
      </Button>
    );
  }
  return (
    <Button size="sm" block onClick={onOffer}>
      참여 제안 보내기
    </Button>
  );
}