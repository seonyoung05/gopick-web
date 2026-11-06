// src/AppRoutes.tsx
// 앱의 모든 경로를 한 곳에서 관리합니다.
// 새 화면을 만들면 아래 <AppLayout> 안에 <Route path="..." element={...} /> 한 줄만 추가하세요.
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout';
import DevPage from './pages/dev/DevPage';
import ProfilePage from './pages/profile/ProfilePage';

function ComingSoon() {
  return <p className="t-body-m">준비 중인 화면이에요.</p>;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* 사이드바·상단바가 필요 없는 개발용 화면 */}
      <Route path="/dev" element={<DevPage />} />

      {/* 사이드바·상단바가 붙는 화면 */}
      <Route element={<AppLayout />}>
        <Route index element={<ComingSoon />} />
        <Route path="profile" element={<ProfilePage />} />
        {/* TODO: 화면이 병합되면 추가 — /projects, /manage, /saved, /offers, 추천·검색 등 */}
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  );
}
