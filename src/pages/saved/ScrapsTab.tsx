// src/pages/saved/ScrapsTab.tsx
// TODO(B): 스크랩한 프로젝트 목록. bookmarksApi.getScrappedProjects() 사용 예정
import styles from './SavedPage.module.css';

export function ScrapsTab() {
  return (
    <div className={styles.empty}>
      <strong>아직 스크랩한 프로젝트가 없어요</strong>
      관심 있는 프로젝트를 스크랩해 두면 여기에서 모아 볼 수 있어요.
    </div>
  );
}