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

const COLLAPSED_W = 64; // w-16 in px
const EXPANDED_W = 288; // w-72 in px
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
        // Move focus back to collapsed strip
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
          // Toggle only if clicking the icon strip area (not a link in expanded panel)
          const target = e.target as HTMLElement;
          if (!target.closest('[data-expanded-link]')) {
            setExpanded((prev) => !prev);
          }
        },
      }
    : {};

  // ── Positioning ───────────────────────────────────────────────────
  const isLeft = position === 'left';
  const fixedSide = isLeft ? 'left-0' : 'right-0';

  // Overlay transform: slide in from the collapsed strip side
  const overlayTransform = expanded
    ? 'translateX(0)'
    : isLeft
      ? `translateX(-${EXPANDED_W - COLLAPSED_W}px)`
      : `translateX(${EXPANDED_W - COLLAPSED_W}px)`;

  const isActiveRoute = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <>
      {/* Collapsed icon strip: render only when closed */}
      {!expanded && (
        <div
          ref={navRef}
          role="navigation"
          aria-label="Main navigation"
          aria-expanded={expanded}
          className={`fixed top-0 ${fixedSide} h-screen bg-primary flex flex-col z-50`}
          style={{ width: COLLAPSED_W }}
          {...hoverHandlers}
          {...focusHandlers}
          {...tapToggle}
          onKeyDown={handleKeyDown}
        >
          {/* Branding icon */}
          <div className="flex items-center justify-center h-[72px] border-b border-white/12">
            <span className="text-[14px] font-semibold text-white tracking-tight">
              AD
            </span>
          </div>

          {/* Icon-only nav */}
          <div className="flex-1 flex flex-col items-center gap-1 pt-3">
            {filtered.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.to);
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
                    flex items-center justify-center w-10 h-10 rounded transition-colors
                    ${isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-[18px] h-[18px]" />
                </Link>
              );
            })}
          </div>

          {/* Footer icon area */}
          <div className="flex items-center justify-center h-12 border-t border-white/12">
            <span className="text-[9px] text-white/40 font-mono">1.0.2</span>
          </div>
        </div>
      )}

      {/* Expanded overlay panel */}
      <div
        aria-hidden={!expanded}
        className={`fixed top-0 ${fixedSide} h-screen bg-primary flex flex-col shadow-lg pointer-events-none ${
          expanded ? 'z-[100]' : 'z-40'
        }`}
        style={{
          width: EXPANDED_W,
          transform: overlayTransform,
          transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >

        <div
          className={
            expanded
              ? 'pointer-events-auto h-full flex flex-col'
              : 'pointer-events-none h-full flex flex-col'
          }
          {...hoverHandlers}
          {...focusHandlers}
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          <div
            className="h-[72px] flex items-center border-b border-white/12"
            style={{ paddingLeft: COLLAPSED_W + 4 }}
          >
            <div>
              <h1 className="text-[18px] font-semibold tracking-tight text-white">
                ADAMAS
              </h1>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Aquatic Data & Monitoring
                <br />
                Analysis System
              </p>
            </div>
          </div>

          {/* Expanded nav links */}
          <div className="flex-1 py-3" style={{ paddingLeft: COLLAPSED_W }}>
            <ul className="space-y-0.5 px-3">
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
                      data-expanded-link
                      to={item.to}
                      tabIndex={expanded ? 0 : -1}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded transition-colors text-[13px]
                        ${isActive
                          ? 'bg-white/20 text-white font-medium'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                      {item.badge && (
                        <span className="ml-auto text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-medium">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Footer */}
          <div
            className="border-t border-white/12 py-3"
            style={{ paddingLeft: COLLAPSED_W }}
          >
            <div className="px-4 text-[11px] text-white/50 leading-relaxed">
              <p className="font-medium text-white/80">Version 1.0.2</p>
              <p className="mt-1.5">Colorado Parks & Wildlife</p>
              <p className="mt-0.5 text-[10px]">Fisheries Program</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
