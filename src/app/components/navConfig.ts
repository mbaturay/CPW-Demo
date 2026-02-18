import { Home, Upload, CheckSquare, Search, BarChart3, Waves, ClipboardList } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  key: string;
  to: string;
  icon: LucideIcon;
  label: string;
  roles: string[];
  dataEntryLabel?: string;
  badge?: string;
}

export const navItems: NavItem[] = [
  { key: 'dashboard', to: '/', icon: Home, label: 'Dashboard', roles: ['data-entry', 'area-biologist', 'senior-biologist'], dataEntryLabel: 'My Waters' },
  { key: 'water', to: '/water', icon: Waves, label: 'Water Profile', roles: ['data-entry', 'area-biologist', 'senior-biologist'] },
  { key: 'upload', to: '/upload', icon: Upload, label: 'Upload Survey', roles: ['data-entry', 'area-biologist', 'senior-biologist'] },
  { key: 'validation', to: '/validation', icon: CheckSquare, label: 'Validation', roles: ['data-entry', 'area-biologist', 'senior-biologist'], dataEntryLabel: 'Validation Queue' },
  { key: 'surveys', to: '/activity-feed', icon: ClipboardList, label: 'Surveys', roles: ['area-biologist', 'senior-biologist'] },
  { key: 'query', to: '/query', icon: Search, label: 'Query Builder', roles: ['area-biologist', 'senior-biologist'] },
  { key: 'insights', to: '/insights', icon: BarChart3, label: 'Insights', roles: ['area-biologist', 'senior-biologist'] },
];
