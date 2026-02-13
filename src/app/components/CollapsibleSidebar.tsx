import { useRef, useState, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Home, Upload, CheckSquare, Search, BarChart3, Waves } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import type { LucideIcon } from 'lucide-react';

// ── Nav config ──────────────────────────────────────────────────────
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
  { key: 'query', to: '/query', icon: Search, label: 'Query Builder', roles: ['area-biologist', 'senior-biologist'] },
  { key: 'insights', to: '/insights', icon: BarChart3, label: 'Insights', roles: ['area-biologist', 'senior-biologist'] },
];

// ── Hover-media detection ───────────────────────────────────────────
function useCanHover() {
  const [canHover, setCanHover] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover)');
    setCanHover(mq.matches);
    const handler = (e: MediaQueryListEvent) => setCanHover(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return canHover;
}

// ── Component ───────────────────────────────────────────────────────
interface CollapsibleSidebarProps {
  position?: 'left' | 'right';
  items?: NavItem[];
}

const COLLAPSED_W = 64;
const EXPANDED_W = 288;
const DEBOUNCE_MS = 80;

export function CollapsibleSidebar({
  position = 'left',
  items,
}: CollapsibleSidebarProps) {
  const location = useLocation();
  const { role } = useRole();
  const canHover = useCanHover();

  const [expanded, setExpanded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const filtered = (items ?? navItems).filter((item) =>
    item.roles.includes(role),
  );

  // ── Debounced open / close ────────────────────────────────────────
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const openSoon = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => setExpanded(true), DEBOUNCE_MS);
  }, [clearTimer]);

  const closeSoon = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => setExpanded(false), DEBOUNCE_MS);
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  // ── Keyboard: Escape closes ───────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpanded(false);
        navRef.current?.querySelector<HTMLElement>('a')?.focus();
      }
    },
    [],
  );

  // ── Handlers ──────────────────────────────────────────────────────
  const hoverHandlers = canHover
    ? { onMouseEnter: openSoon, onMouseLeave: closeSoon }
    : {};

  const focusHandlers = {
    onFocus: openSoon,
    onBlur: (e: React.FocusEvent) => {
      if (!navRef.current?.contains(e.relatedTarget as Node)) {
        closeSoon();
      }
    },
  };

  // Touch: tap link when collapsed → expand instead of navigate
  const handleLinkClick = useCallback(
    (e: React.MouseEvent) => {
      if (!canHover && !expanded) {
        e.preventDefault();
        setExpanded(true);
      }
    },
    [canHover, expanded],
  );

  // Touch: tap non-link area → toggle
  const handleContainerClick = !canHover
    ? (e: React.MouseEvent) => {
        if (!(e.target as HTMLElement).closest('a')) {
          setExpanded((prev) => !prev);
        }
      }
    : undefined;

  const isLeft = position === 'left';
  const fixedSide = isLeft ? 'left-0' : 'right-0';

  const isActiveRoute = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <div
      ref={navRef}
      role="navigation"
      aria-label="Main navigation"
      className={`fixed top-0 ${fixedSide} h-screen z-50 overflow-hidden ${
        expanded ? 'shadow-lg' : ''
      }`}
      style={{
        width: expanded ? EXPANDED_W : COLLAPSED_W,
        transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      {...hoverHandlers}
      {...focusHandlers}
      onClick={handleContainerClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className="h-full bg-primary flex flex-col"
        style={{ width: EXPANDED_W }}
      >
        {/* Branding */}
        <div className="h-14 shrink-0 flex items-center border-b border-white/15">
          <div className="w-16 shrink-0 flex items-center justify-center">
            <span
              className={`text-[14px] font-semibold text-white tracking-tight transition-opacity duration-200 ${
                expanded ? 'opacity-0' : 'opacity-100'
              }`}
            >
              AD
            </span>
          </div>
          <div>
            <h1 className="text-[18px] font-semibold tracking-tight text-white leading-tight whitespace-nowrap">
              ADAMAS
            </h1>
            <p className="text-[11px] text-white/50 leading-snug whitespace-nowrap">
              Aquatic Data & Monitoring
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 pt-3 px-3">
          <ul className="space-y-0.5">
            {filtered.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.to);
              const label =
                role === 'data-entry' && item.dataEntryLabel
                  ? item.dataEntryLabel
                  : item.label;
              return (
                <li key={item.key}>
                  <Link
                    to={item.to}
                    aria-label={label}
                    title={!expanded ? label : undefined}
                    onClick={handleLinkClick}
                    className={`
                      flex items-center h-10 rounded transition-colors
                      ${isActive
                        ? 'bg-white/20 text-white font-medium'
                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <div className="w-10 shrink-0 flex items-center justify-center">
                      <Icon className="w-[18px] h-[18px]" />
                    </div>
                    <span className="text-[13px] whitespace-nowrap ml-3">
                      {label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-auto shrink-0 border-t border-white/12 py-3 flex">
          <div className="w-16 shrink-0 flex items-center justify-center">
            <span
              className={`text-[9px] text-white/40 font-mono transition-opacity duration-200 ${
                expanded ? 'opacity-0' : 'opacity-100'
              }`}
            >
              1.0.2
            </span>
          </div>
          <div className="text-[11px] text-white/50 leading-relaxed whitespace-nowrap">
            <p className="font-medium text-white/80">Version 1.0.2</p>
            <p className="mt-1">Colorado Parks & Wildlife</p>
            <p className="text-[10px]">Fisheries Program</p>
          </div>
        </div>
      </div>
    </div>
  );
}
