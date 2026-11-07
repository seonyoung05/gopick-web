// src/pages/saved/SavedPage.tsx
import { useState } from 'react';
import { Tabs } from '../../components/ui/Tabs';
import { MOCK_SAVED_PROFILES } from '../../mocks/saved';
import { SavedProfilesTab } from './SavedProfilesTab';
import { ScrapsTab } from './ScrapsTab';
import styles from './SavedPage.module.css';

type SavedTab = 'profiles' | 'scraps';

export default function SavedPage() {
  const [tab, setTab] = useState<SavedTab>('profiles');

  // TODO: API 연결 시 실제 개수로
  const profileCount = MOCK_SAVED_PROFILES.length;
  const scrapCount = 0;

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
          { value: 'profiles', label: `저장한 프로필 ${profileCount}` },
          { value: 'scraps', label: `스크랩한 프로젝트 ${scrapCount}` },
        ]}
      />

      <div className={styles.panel} role="tabpanel">
        {tab === 'profiles' ? <SavedProfilesTab /> : <ScrapsTab />}
      </div>
    </div>
  );
}