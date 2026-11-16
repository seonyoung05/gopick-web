// src/constants/nav.ts
import {
  House,
  FolderPlus,
  ChartLine,
  Bookmark,
  Mail,
  User,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** 정확히 일치할 때만 활성화 (홈) */
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: '홈', icon: House, end: true },
  { to: '/manage', label: '내 프로젝트', icon: FolderPlus },
  { to: '/projects', label: '프로젝트 목록', icon: ChartLine },
  { to: '/saved', label: '저장함', icon: Bookmark },
  { to: '/offers', label: '제안·지원', icon: Mail },
  { to: '/profile', label: '내 프로필', icon: User },
];
