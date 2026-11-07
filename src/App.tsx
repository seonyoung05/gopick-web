// src/App.tsx
import DevPage from './pages/dev/DevPage';
import ProfilePage from './pages/profile/ProfilePage';
import PeopleSearchPage from './pages/people/PeopleSearchPage';
import RecommendPage from './pages/recommend/RecommendPage';

export default function App() {
  // 임시: 라우팅 생기면 삭제
  const page = new URLSearchParams(window.location.search).get('page');
  if (page === 'profile') return <ProfilePage />;
  if (page === 'people') return <PeopleSearchPage />;
  if (page === 'recommend') return <RecommendPage />;
  return <DevPage />;
}