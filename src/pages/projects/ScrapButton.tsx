// src/pages/projects/ScrapButton.tsx
import { Bookmark } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface ScrapButtonProps {
  scrapped: boolean;
  onToggle: () => void;
  /** 글자 없이 아이콘만 (목록 카드용) */
  iconOnly?: boolean;
}

/** 공통 Button을 감싼 스크랩 토글 (Figma: active = 스크랩됨, ghost = 스크랩) */
export function ScrapButton({ scrapped, onToggle, iconOnly = false }: ScrapButtonProps) {
  return (
    <Button
      size="sm"
      variant={scrapped ? 'active' : 'ghost'}
      icon={<Bookmark fill={scrapped ? 'currentColor' : 'none'} />}
      aria-pressed={scrapped}
      aria-label={scrapped ? '스크랩 해제' : '스크랩'}
      onClick={onToggle}
    >
      {iconOnly ? null : scrapped ? '스크랩됨' : '스크랩'}
    </Button>
  );
}
