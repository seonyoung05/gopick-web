// src/App.tsx
import DevPage from './pages/dev/DevPage';
import ProfilePage from './pages/profile/ProfilePage';

export default function App() {
  // 임시: 라우팅 생기면 삭제
  const page = new URLSearchParams(window.location.search).get('page');
  if (page === 'profile') return <ProfilePage />;
  return <DevPage />;
}