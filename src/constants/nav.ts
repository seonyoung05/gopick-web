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
  { to: '/manage', label: '프로젝트 관리', icon: FolderPlus },
  { to: '/projects', label: '프로젝트', icon: ChartLine },
  { to: '/saved', label: '저장함', icon: Bookmark },
  { to: '/offers', label: '제안·지원', icon: Mail },
  { to: '/profile', label: '내 프로필', icon: User },
];

// TODO: 백엔드 연동 시 API 값으로 교체 (지금은 목업)
export const MOCK_USER = { name: '김수뭉' };
export const MOCK_UNREAD_COUNT = 3;
export const MOCK_SUMMARY = { recruiting: 4, ongoing: 3, done: 2 };
export const MOCK_DECISION_NOTE = '10/10 회의 결정사항 반영 (v8)';
