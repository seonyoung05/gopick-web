// src/AppRoutes.tsx
// 앱의 모든 경로를 한 곳에서 관리합니다.
// 새 화면을 만들면 아래 <AppLayout> 안에 <Route path="..." element={...} /> 한 줄만 추가하세요.
import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom';
import { AppLayout } from './components/layout';
import DevPage from './pages/dev/DevPage';
import ProfilePage from './pages/profile/ProfilePage';
import PeopleSearchPage from './pages/people/PeopleSearchPage';
import RecommendPage from './pages/recommend/RecommendPage';
import SavedPage from './pages/saved/SavedPage';
import InboxPage from './pages/inbox/InboxPage';

function ComingSoon() {
  return <p className="t-body-m">준비 중인 화면이에요.</p>;
}

// 라우팅 도입 전 임시 주소(?page=...)를 쓰던 화면의 버튼들이 계속 동작하도록 새 경로로 넘겨줘요.
// (RecommendPage, SavedProfilesTab 이 아직 ?page=people 로 이동해요. 해당 화면이 navigate('/search')로 바뀌면 지워도 돼요.)
const LEGACY_PAGE_PATH: Record<string, string> = {
  profile: '/profile',
  people: '/search',
  recommend: '/recommend',
  saved: '/saved',
  inbox: '/offers',
};

function HomeOrLegacyRedirect() {
  const [params] = useSearchParams();
  const target = LEGACY_PAGE_PATH[params.get('page') ?? ''];
  return target ? <Navigate to={target} replace /> : <ComingSoon />;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* 사이드바·상단바가 필요 없는 개발용 화면 */}
      <Route path="/dev" element={<DevPage />} />

      {/* 사이드바·상단바가 붙는 화면 */}
      <Route element={<AppLayout />}>
        <Route index element={<HomeOrLegacyRedirect />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="search" element={<PeopleSearchPage />} />
        <Route path="recommend" element={<RecommendPage />} />
        <Route path="saved" element={<SavedPage />} />
        {/* 사이드바의 '제안·지원' 메뉴는 /offers 로 연결돼 있어요 */}
        <Route path="offers" element={<InboxPage />} />
        {/* TODO: 화면이 병합되면 추가 — /projects, /manage */}
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  );
}
