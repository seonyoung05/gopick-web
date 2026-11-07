// src/pages/dev/sections/ButtonSection.tsx
import { Bookmark } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export function ButtonSection() {
  return (
    <section>
      <h1 className="t-h1">Button</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <Button>프로젝트 모집 등록</Button>
        <Button variant="ghost">내 프로필 작성</Button>
        <Button variant="ai">모집글 초안 만들기</Button>
        <Button variant="saved" size="sm">★ 저장됨</Button>
        <Button variant="active" size="sm" icon={<Bookmark />}>스크랩</Button>
        <Button variant="ghost" size="sm" icon={<Bookmark />}>스크랩</Button>
        <Button size="sm">참여 제안 보내기</Button>
        <Button disabled>비활성</Button>
      </div>
      <div style={{ width: 320, marginTop: 16 }}>
        <Button block>지원하기 (block)</Button>
      </div>
    </section>
  );
}