// src/pages/saved/SavedPage.tsx
import { useEffect, useState } from 'react';
import { profilesApi, projectsApi } from '../../api';
import { Tabs } from '../../components/ui/Tabs';
import { SavedProfilesTab } from './SavedProfilesTab';
import { ScrapsTab } from './ScrapsTab';
import styles from './SavedPage.module.css';

type SavedTab = 'profiles' | 'scraps';

export default function SavedPage() {
  const [tab, setTab] = useState<SavedTab>('profiles');
  const [profileCount, setProfileCount] = useState<number | null>(null);
  const [scrapCount, setScrapCount] = useState<number | null>(null);

  // 탭 제목에 보여 줄 개수 (실패하면 숫자 없이 표시)
  useEffect(() => {
    profilesApi
      .myBookmarks()
      .then((list) => setProfileCount(list.length))
      .catch(() => undefined);
    projectsApi
      .myScraps()
      .then((list) => setScrapCount(list.length))
      .catch(() => undefined);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <h1 className="t-h1">저장함</h1>
        <p>저장한 구성원 프로필과 스크랩한 프로젝트를 모아 봐요. 저장함은 나만 볼 수 있어요.</p>
      </div>

      <Tabs
        aria-label="저장함"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'profiles', label: `저장한 프로필 ${profileCount ?? ''}`.trim() },
          { value: 'scraps', label: `스크랩한 프로젝트 ${scrapCount ?? ''}`.trim() },
        ]}
      />

      <div className={styles.panel} role="tabpanel">
        {tab === 'profiles' ? <SavedProfilesTab onCountChange={setProfileCount} /> : <ScrapsTab onCountChange={setScrapCount} />}
      </div>
    </div>
  );
}