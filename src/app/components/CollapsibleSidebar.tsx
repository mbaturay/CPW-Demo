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

const COLLAPSED_W = 64;   // w-16 in px
const EXPANDED_W = 288;   // w-72 in px
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

  // Filtered nav items
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

  // Cleanup on unmount
  useEffect(() => () => clearTimer(), [clearTimer]);

  // ── Keyboard: Escape closes ───────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpanded(false);
        // Move focus back to first nav link
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
      // Only close if focus leaves the entire sidebar
      if (!navRef.current?.contains(e.relatedTarget as Node)) {
        closeSoon();
      }
    },
  };

  const tapToggle = !canHover
    ? {
        onClick: (e: React.MouseEvent) => {
          // Toggle only if clicking empty sidebar area (not links)
          const target = e.target as HTMLElement;
          if (!target.closest('a')) {
            setExpanded((prev) => !prev);
          }
        },
      }
    : {};

  // ── Positioning ───────────────────────────────────────────────────
  const isLeft = position === 'left';
  const fixedSide = isLeft ? 'left-0' : 'right-0';

  return (
    <>
      {/* Single-layer sidebar: width expands/collapses (no second panel) */}
      <div
        ref={navRef}
        role="navigation"
        aria-label="Main navigation"
        aria-expanded={expanded}
        className={`fixed top-0 ${fixedSide} h-screen bg-white border-r border-border flex flex-col z-50 shadow-lg overflow-hidden`}
        style={{
          width: expanded ? EXPANDED_W : COLLAPSED_W,
          transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        {...hoverHandlers}
        {...focusHandlers}
        {...tapToggle}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="h-[72px] border-b border-border flex items-center">
          <div className="flex items-center justify-center" style={{ width: COLLAPSED_W }}>
            <span className="text-[14px] font-semibold text-primary tracking-tight">AD</span>
          </div>

          {/* Brand text only when expanded */}
          {expanded && (
            <div className="pl-2">
              <h1 className="text-[18px] font-semibold tracking-tight text-primary">
                ADAMAS
              </h1>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Aquatic Data & Monitoring<br />Analysis System
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="flex-1 pt-3">
          {filtered.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            const label =
              role === 'data-entry' && item.dataEntryLabel
                ? item.dataEntryLabel
                : item.label;

            return (
              <Link
                key={item.key}
                to={item.to}
                aria-label={label}
                title={label}
                className={`
                  flex items-center rounded transition-colors mx-2 my-1
                  ${isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }
                `}
                style={{
                  height: 40,
                }}
              >
                {/* Icon column stays fixed */}
                <div className="flex items-center justify-center" style={{ width: COLLAPSED_W }}>
                  <Icon className="w-[18px] h-[18px]" />
                </div>

                {/* Label appears only when expanded */}
                {expanded && (
                  <div className="flex-1 pr-3 text-[13px]">
                    <span className={isActive ? 'font-medium' : ''}>{label}</span>
                    {item.badge && (
                      <span className="ml-2 text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-medium">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="h-12 border-t border-border flex items-center">
          <div className="flex items-center justify-center" style={{ width: COLLAPSED_W }}>
            <span className="text-[9px] text-muted-foreground font-mono">1.0.2</span>
          </div>

          {expanded && (
            <div className="px-2 text-[11px] text-muted-foreground">
              <p className="font-medium text-foreground">Version 1.0.2</p>
              <p className="mt-1.5">Colorado Parks & Wildlife</p>
              <p className="mt-0.5 text-[10px]">Fisheries Program</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
